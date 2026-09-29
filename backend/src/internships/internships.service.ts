import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { saveCatchingConflict } from '../common/database/save-with-conflict';
import { Company } from '../companies/entities/company.entity';
import { Student } from '../students/entities/student.entity';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { Supervisor } from '../supervisors/entities/supervisor.entity';
import { ChangeSupervisorDto } from './dto/change-supervisor.dto';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { FindAvailableSupervisorsDto } from './dto/find-available-supervisors.dto';
import { FindInternshipsDto } from './dto/find-internships.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { Internship } from './entities/internship.entity';
import { InternshipSupervisorHistory } from './entities/internship-supervisor-history.entity';
import { InternshipStatus } from './enums/internship-status.enum';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Charge maximale d'un encadreur, comptée sur les stages actifs uniquement :
 * un stage terminé ou annulé ne libère plus de place pour le suivant.
 */
export const MAX_INTERNSHIPS_PER_SUPERVISOR = 10;

const ACTIVE_INTERNSHIP_STATUSES = [
  InternshipStatus.EN_COURS,
  InternshipStatus.A_VENIR,
];

interface AuthenticatedUser {
  id: string;
  role: Role;
}


@Injectable()
export class InternshipsService {
  constructor(
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Supervisor)
    private readonly supervisorsRepository: Repository<Supervisor>,
    @InjectRepository(InternshipSupervisorHistory)
    private readonly historyRepository: Repository<InternshipSupervisorHistory>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateInternshipDto, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    this.ensureDateOrder(dto.dateDebut, dto.dateFin);
    const student = await this.findStudent(dto.studentId);
    const company = await this.findCompany(dto.companyId);
    const supervisor = await this.findSupervisor(dto.supervisorId);
    // La limite ne porte que sur les stages actifs. Créer directement un stage
    // terminé ou annulé (rattrapage de saisie) ne consomme donc aucune place.
    if (this.isActiveStatus(dto.statut)) {
      await this.ensureSupervisorHasCapacity(dto.supervisorId);
    }
    const internship = this.internshipsRepository.create({
      ...dto,
      student,
      company,
      supervisor,
    });
    const savedInternship = await this.saveAndSerialize(internship);
    // Affectation initiale : elle entre aussi au journal, avec un ancien
    // encadreur nul, pour que l'historique soit complet dès la création.
    await this.recordSupervisorHistory(
      internship,
      null,
      dto.supervisorId,
      actor.id,
    );
    await this.notificationsService.notifyStageAssigned(internship);
    return savedInternship;
  }

  async findAll(dto: FindInternshipsDto, actor: AuthenticatedUser) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const query = this.internshipsRepository
      .createQueryBuilder('internship')
      .innerJoinAndSelect('internship.student', 'student')
      .innerJoinAndSelect('student.user', 'studentUser')
      .innerJoinAndSelect('internship.company', 'company')
      .innerJoinAndSelect('internship.supervisor', 'supervisor')
      // Nécessaire pour que toPublicInternship puisse exposer le nom de
      // l'encadreur : sans ce join, supervisor.user est undefined sur les
      // listes alors qu'il est chargé sur findOne.
      .innerJoinAndSelect('supervisor.user', 'supervisorUser');

    this.applyAccessScope(query, actor);
    if (dto.studentId)
      query.andWhere('internship.studentId = :studentId', {
        studentId: dto.studentId,
      });
    if (dto.companyId)
      query.andWhere('internship.companyId = :companyId', {
        companyId: dto.companyId,
      });
    if (dto.supervisorId)
      query.andWhere('internship.supervisorId = :supervisorId', {
        supervisorId: dto.supervisorId,
      });
    if (dto.statut)
      query.andWhere('internship.statut = :statut', { statut: dto.statut });
    if (dto.ville)
      query.andWhere('LOWER(internship.ville) = LOWER(:ville)', {
        ville: dto.ville,
      });
    if (dto.domaine)
      query.andWhere('LOWER(internship.domaine) LIKE LOWER(:domaine)', {
        domaine: `%${dto.domaine}%`,
      });
    if (dto.search) {
      query.andWhere(
        '(LOWER(internship.intitule) LIKE LOWER(:search) OR LOWER(internship.domaine) LIKE LOWER(:search) OR LOWER(internship.ville) LIKE LOWER(:search) OR LOWER(company.nom) LIKE LOWER(:search) OR LOWER(student.matricule) LIKE LOWER(:search))',
        { search: `%${dto.search}%` },
      );
    }

    const [internships, total] = await query
      .orderBy('internship.dateDebut', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: internships.map((internship) =>
        this.toPublicInternship(internship),
      ),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const internship = await this.findEntity(id);
    this.ensureCanAccess(internship, actor);
    return this.toPublicInternship(internship);
  }

  /**
   * Affectation d'un encadreur sur un stage — opération réservée à
   * l'administrateur. Les autres rôles n'ont qu'un droit de lecture.
   */
  async changeSupervisor(
    id: string,
    dto: ChangeSupervisorDto,
    actor: AuthenticatedUser,
  ) {
    this.ensureAdmin(actor);
    const internship = await this.findEntity(id);

    if (internship.supervisorId === dto.supervisorId) {
      throw new BadRequestException(
        'Cet encadreur est déjà affecté à ce stage.',
      );
    }

    const supervisor = await this.findSupervisor(dto.supervisorId);
    await this.ensureSupervisorHasCapacity(dto.supervisorId, id);

    const previousSupervisorId = internship.supervisorId;
    // Historique avant la modification, pour qu'un échec d'écriture du stage
    // ne laisse pas le journal annoncer un changement qui n'a pas eu lieu.
    await this.recordSupervisorHistory(
      internship,
      previousSupervisorId,
      dto.supervisorId,
      actor.id,
    );
    internship.supervisor = supervisor;
    internship.supervisorId = dto.supervisorId;

    const savedInternship = await this.saveAndSerialize(internship);
    await this.notificationsService.notifyStageAssigned(internship);
    return savedInternship;
  }

  /**
   * Journal des affectations d'un stage, du plus récent au plus ancien.
   * Réservé à l'administrateur et à l'enseignant : l'enseignant consulte sans
   * jamais pouvoir affecter.
   */
  async getSupervisorHistory(id: string, actor: AuthenticatedUser) {
    this.ensureAdminOrEnseignant(actor);
    await this.findEntity(id);

    const history = await this.historyRepository.find({
      where: { internshipId: id },
      relations: {
        ancienSupervisor: { user: true },
        nouveauSupervisor: { user: true },
        affectedByUser: true,
      },
      order: { dateAffectation: 'DESC' },
    });

    return history.map((entry) => ({
      id: entry.id,
      ancienSupervisor: this.toPublicSupervisorRef(entry.ancienSupervisor),
      nouveauSupervisor: this.toPublicSupervisorRef(entry.nouveauSupervisor),
      affectedBy: entry.affectedByUser
        ? {
            id: entry.affectedByUser.id,
            nom: entry.affectedByUser.nom,
            prenom: entry.affectedByUser.prenom,
          }
        : null,
      dateAffectation: entry.dateAffectation,
    }));
  }

  /**
   * Encadreurs avec leur charge, pour alimenter le sélecteur d'affectation.
   * Un encadreur déjà à la limite est renvoyé avec disponible=false plutôt
   * qu'omis : l'interface affiche alors « 10/10 » en désactivé, ce qui explique
   * au lecteur pourquoi le choix est refusé.
   */
  async findAvailableSupervisors(
    dto: FindAvailableSupervisorsDto,
    actor: AuthenticatedUser,
  ) {
    this.ensureAdmin(actor);
    const excludedId = dto.excludeInternshipId ?? '00000000-0000-0000-0000-000000000000';

    const rows = await this.supervisorsRepository
      .createQueryBuilder('supervisor')
      .innerJoinAndSelect('supervisor.user', 'supervisorUser')
      .leftJoin(
        'internships',
        'activeInternship',
        'activeInternship.supervisorId = supervisor.id AND activeInternship.statut IN (:...statuses) AND activeInternship.dateSuppression IS NULL AND activeInternship.id != :excludedId',
        { statuses: ACTIVE_INTERNSHIP_STATUSES, excludedId: excludedId },
      )
      .select('supervisor.id', 'id')
      .addSelect('supervisor.fonction', 'fonction')
      .addSelect('supervisor.specialite', 'specialite')
      .addSelect('supervisorUser.nom', 'nom')
      .addSelect('supervisorUser.prenom', 'prenom')
      .addSelect('COUNT(activeInternship.id)', 'stagesActifs')
      .groupBy('supervisor.id')
      .addGroupBy('supervisor.fonction')
      .addGroupBy('supervisor.specialite')
      .addGroupBy('supervisorUser.nom')
      .addGroupBy('supervisorUser.prenom')
      .orderBy('supervisorUser.nom', 'ASC')
      .getRawMany<{
        id: string;
        nom: string;
        prenom: string;
        fonction: string;
        specialite: string;
        stagesActifs: string;
      }>();

    return rows.map((row) => {
      const stagesActifs = Number(row.stagesActifs);
      return {
        id: row.id,
        nom: row.nom,
        prenom: row.prenom,
        fonction: row.fonction,
        specialite: row.specialite,
        stagesActifs,
        maxStages: MAX_INTERNSHIPS_PER_SUPERVISOR,
        disponible: stagesActifs < MAX_INTERNSHIPS_PER_SUPERVISOR,
      };
    });
  }

  async update(id: string, dto: UpdateInternshipDto, actor: AuthenticatedUser) {
    const internship = await this.findEntity(id);
    this.ensureCanAccess(internship, actor);
    const previousStatus = internship.statut;
    const previousAssignment = `${internship.studentId}:${internship.companyId}:${internship.supervisorId}`;

    if (actor.role === Role.ADMINISTRATEUR) {
      if (dto.dateDebut || dto.dateFin) {
        this.ensureDateOrder(
          dto.dateDebut ?? internship.dateDebut,
          dto.dateFin ?? internship.dateFin,
        );
      }
      if (dto.studentId)
        internship.student = await this.findStudent(dto.studentId);
      if (dto.companyId)
        internship.company = await this.findCompany(dto.companyId);

      // supervisorId retiré de la charge utile : passer par ici plutôt que par
      // Object.assign est ce qui garantit que l'historique est écrit et que la
      // limite de 10 est vérifiée, y compris quand le client envoie le stage
      // complet dans un seul PATCH au lieu d'appeler /supervisor.
      const { supervisorId, ...stageFields } = dto;
      if (supervisorId && supervisorId !== internship.supervisorId) {
        await this.applySupervisorChange(internship, supervisorId, actor);
      }

      Object.assign(internship, stageFields);
      const savedInternship = await this.saveAndSerialize(internship);
      await this.notificationsService.notifyStageModified(internship);
      const currentAssignment = `${internship.studentId}:${internship.companyId}:${internship.supervisorId}`;
      if (previousAssignment !== currentAssignment) {
        await this.notificationsService.notifyStageAssigned(internship);
      }
      if (
        previousStatus !== InternshipStatus.TERMINE &&
        internship.statut === InternshipStatus.TERMINE
      ) {
        await this.notificationsService.notifyStageFinished(internship);
      }
      return savedInternship;
    }

    if (actor.role === Role.ETUDIANT) {
      throw new ForbiddenException(
        'Un étudiant ne peut pas modifier un stage.',
      );
    }
    const keys = Object.keys(dto);
    if (keys.some((key) => key !== 'observations')) {
      throw new ForbiddenException(
        'Seul le champ observations peut être modifié.',
      );
    }
    internship.observations = dto.observations ?? internship.observations;
    const savedInternship = await this.saveAndSerialize(internship);
    await this.notificationsService.notifyStageModified(internship);
    return savedInternship;
  }

  async remove(id: string, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    const internship = await this.findEntity(id);
    await this.internshipsRepository.softRemove(internship);
    return { message: 'Stage supprimé logiquement avec succès.' };
  }

  private applyAccessScope(
    query: ReturnType<Repository<Internship>['createQueryBuilder']>,
    actor: AuthenticatedUser,
  ) {
    if (actor.role === Role.ETUDIANT) {
      query.andWhere('studentUser.id = :actorId', { actorId: actor.id });
    } else if (actor.role === Role.ENTREPRISE) {
      query.andWhere('company.userId = :actorId', { actorId: actor.id });
    } else if (actor.role === Role.ENCADREUR) {
      query.andWhere('supervisor.userId = :actorId', { actorId: actor.id });
    } else if (actor.role !== Role.ADMINISTRATEUR) {
      query.andWhere('1 = 0');
    }
  }

  private async findEntity(id: string) {
    const internship = await this.internshipsRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        company: { user: true },
        supervisor: { user: true },
      },
    });
    if (!internship) throw new NotFoundException('Stage introuvable.');
    return internship;
  }

  private async findStudent(id: string) {
    const student = await this.studentsRepository.findOne({
      where: { id, dateSuppression: undefined },
    });
    if (!student) throw new NotFoundException('Étudiant introuvable.');
    return student;
  }

  private async findCompany(id: string) {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!company) throw new NotFoundException('Entreprise introuvable.');
    return company;
  }

  private async findSupervisor(id: string) {
    const supervisor = await this.supervisorsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!supervisor) throw new NotFoundException('Encadreur introuvable.');

    // Le rôle ENCADREUR est vérifié côté users, pas seulement par la présence
    // de la ligne supervisors : sans ce contrôle, un compte dont le rôle a été
    // requalifié resterait affectable.
    const user = await this.usersService.findActiveById(supervisor.userId);
    if (!user || user.role !== Role.ENCADREUR) {
      throw new NotFoundException('Encadreur introuvable ou inactif.');
    }
    return supervisor;
  }

  /**
   * Charge courante d'un encadreur sur ses stages actifs.
   *
   * excludeInternshipId écarte un stage du décompte : sur la fiche d'un stage,
   * l'encadreur déjà affecté ne doit pas être compté deux fois, sinon il
   * apparaîtrait à 11/10 et son propre stage ne pourrait plus être réaffecté.
   */
  private async countActiveInternships(
    supervisorId: string,
    excludeInternshipId?: string,
  ): Promise<number> {
    const query = this.internshipsRepository
      .createQueryBuilder('internship')
      .where('internship.supervisorId = :supervisorId', { supervisorId })
      .andWhere('internship.statut IN (:...statuses)', {
        statuses: ACTIVE_INTERNSHIP_STATUSES,
      })
      .andWhere('internship.dateSuppression IS NULL');

    if (excludeInternshipId) {
      query.andWhere('internship.id != :excludeInternshipId', {
        excludeInternshipId,
      });
    }

    return query.getCount();
  }

  /**
   * Un stage absent de statut vaut A_VENIR côté base (valeur par défaut de la
   * colonne), donc actif : ne pas le compter comme inactif sous-estimerait la
   * charge d'un encadreur.
   */
  private isActiveStatus(statut?: InternshipStatus): boolean {
    if (!statut) return true;
    return ACTIVE_INTERNSHIP_STATUSES.includes(statut);
  }

  private async ensureSupervisorHasCapacity(
    supervisorId: string,
    excludeInternshipId?: string,
  ) {
    const activeCount = await this.countActiveInternships(
      supervisorId,
      excludeInternshipId,
    );
    if (activeCount >= MAX_INTERNSHIPS_PER_SUPERVISOR) {
      throw new ConflictException(
        `Cet encadreur atteint déjà la limite de ${MAX_INTERNSHIPS_PER_SUPERVISOR} stages actifs. Choisissez un autre encadreur.`,
      );
    }
  }

  private async recordSupervisorHistory(
    internship: Internship,
    ancienSupervisorId: string | null,
    nouveauSupervisorId: string,
    affectedByUserId: string,
  ) {
    await this.historyRepository.save(
      this.historyRepository.create({
        internshipId: internship.id,
        ancienSupervisorId,
        nouveauSupervisorId,
        affectedByUserId,
      }),
    );
  }

  /**
   * Point de passage unique de tout changement d'encadreur : c'est ici que sont
   * Concentrés l'écriture de l'historique et le contrôle de la limite, de sorte
   * que changeSupervisor() et update() ne puissent pas les contourner.
   */
  private async applySupervisorChange(
    internship: Internship,
    newSupervisorId: string,
    actor: AuthenticatedUser,
  ) {
    const supervisor = await this.findSupervisor(newSupervisorId);
    // Même règle qu'à la création : réaffecter un stage déjà terminé ne doit
    // pas être bloqué par la limite, puisque le stage ne compte pas comme actif.
    if (this.isActiveStatus(internship.statut)) {
      await this.ensureSupervisorHasCapacity(newSupervisorId, internship.id);
    }
    await this.recordSupervisorHistory(
      internship,
      internship.supervisorId,
      newSupervisorId,
      actor.id,
    );
    internship.supervisor = supervisor;
    internship.supervisorId = newSupervisorId;
  }

  private toPublicSupervisorRef(supervisor: Supervisor | null) {
    if (!supervisor) return null;
    return {
      id: supervisor.id,
      nom: supervisor.user?.nom,
      prenom: supervisor.user?.prenom,
      fonction: supervisor.fonction,
      specialite: supervisor.specialite,
    };
  }

  private ensureDateOrder(dateDebut: string, dateFin: string) {
    if (dateFin < dateDebut)
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début.',
      );
  }

  private ensureAdmin(actor: AuthenticatedUser) {
    if (actor.role !== Role.ADMINISTRATEUR)
      throw new ForbiddenException(
        'Seul un administrateur peut effectuer cette action.',
      );
  }

  private ensureAdminOrEnseignant(actor: AuthenticatedUser) {
    if (
      actor.role !== Role.ADMINISTRATEUR &&
      actor.role !== Role.ENSEIGNANT
    ) {
      throw new ForbiddenException(
        'Accès réservé aux administrateurs et enseignants.',
      );
    }
  }

  private ensureCanAccess(internship: Internship, actor: AuthenticatedUser) {
    const allowed =
      actor.role === Role.ADMINISTRATEUR ||
      (actor.role === Role.ETUDIANT &&
        internship.student.user?.id === actor.id) ||
      (actor.role === Role.ENTREPRISE &&
        internship.company.user?.id === actor.id) ||
      (actor.role === Role.ENCADREUR &&
        internship.supervisor.user?.id === actor.id);
    if (!allowed)
      throw new ForbiddenException('Vous ne pouvez pas accéder à ce stage.');
  }

  private async saveAndSerialize(internship: Internship) {
    return saveCatchingConflict(
      async () =>
        this.toPublicInternship(
          await this.internshipsRepository.save(internship),
        ),
      'Ce stage existe déjà.',
    );
  }

  private toPublicInternship(internship: Internship) {
    return {
      id: internship.id,
      student: internship.student
        ? {
            id: internship.student.id,
            matricule: internship.student.matricule,
            user: internship.student.user
              ? {
                  id: internship.student.user.id,
                  nom: internship.student.user.nom,
                  prenom: internship.student.user.prenom,
                }
              : undefined,
          }
        : undefined,
      company: internship.company
        ? {
            id: internship.company.id,
            nom: internship.company.nom,
            ville: internship.company.ville,
          }
        : undefined,
      supervisorId: internship.supervisorId,
      supervisor: internship.supervisor
        ? {
            id: internship.supervisor.id,
            fonction: internship.supervisor.fonction,
            specialite: internship.supervisor.specialite,
            user: internship.supervisor.user
              ? {
                  id: internship.supervisor.user.id,
                  nom: internship.supervisor.user.nom,
                  prenom: internship.supervisor.user.prenom,
                }
              : undefined,
          }
        : undefined,
      intitule: internship.intitule,
      description: internship.description,
      domaine: internship.domaine,
      lieu: internship.lieu,
      ville: internship.ville,
      latitude: internship.latitude,
      longitude: internship.longitude,
      dateDebut: internship.dateDebut,
      dateFin: internship.dateFin,
      statut: internship.statut,
      observations: internship.observations,
      dateCreation: internship.dateCreation,
      dateModification: internship.dateModification,
    };
  }
}
