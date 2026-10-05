import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { Internship } from '../internships/entities/internship.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';
import { FindTeacherAssignmentsDto } from './dto/find-teacher-assignments.dto';
import { UpdateTeacherAssignmentDto } from './dto/update-teacher-assignment.dto';
import { TeacherAssignment } from './entities/teacher-assignment.entity';

// Un encadreur pédagogique peut suivre au maximum 10 étudiants actifs
// simultanément (borne globale, pas de colonne par utilisateur).
const MAX_STAGIAIRES_PAR_ENCADREUR = 10;

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class TeacherAssignmentsService {
  constructor(
    @InjectRepository(TeacherAssignment)
    private readonly assignmentsRepository: Repository<TeacherAssignment>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==========================================================================
  // cote ETUDIANT : la seule source de verite du selecteur "tuteur pedagogique"
  // ==========================================================================

  // Ne liste que les enseignants affectes a l'etudiant connecte. Le studentId
  // n'est pas un parametre : il est deduit du JWT, donc impossible de usurper
  // l'affectation d'un autre etudiant.
  async findMyTeachers(actor: AuthenticatedUser) {
    const rows = await this.assignmentsRepository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.teacher', 'teacher')
      .innerJoinAndSelect('assignment.student', 'student')
      .innerJoin('student.user', 'studentUser')
      .where('studentUser.id = :actorId', { actorId: actor.id })
      .andWhere('assignment.dateFin IS NULL')
      // Un enseignant desactive ne doit plus etre propose a l'etudiant.
      .andWhere('teacher.actif = true')
      .orderBy('teacher.nom', 'ASC')
      .addOrderBy('teacher.prenom', 'ASC')
      .getMany();

    return {
      data: rows.map((row) => this.toPublicTeacher(row)),
    };
  }

  // ==========================================================================
  // cote ADMINISTRATEUR
  // ==========================================================================

  // Listes de selection de la page admin, sans pagination : une page
  // d'affectation a besoin de la totality des etudiants et des enseignants.
  async getOptions() {
    const students = await this.studentsRepository
      .createQueryBuilder('student')
      .innerJoinAndSelect('student.user', 'user')
      .where('student.dateSuppression IS NULL')
      .orderBy('student.matricule', 'ASC')
      .getMany();

    const teachers = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: Role.ENSEIGNANT })
      .andWhere('user.actif = true')
      .orderBy('user.nom', 'ASC')
      .getMany();

    // Compteur d'étudiants par encadreur : nombre d'affectations actives
    // (date_fin NULL) groupees par enseignant.
    const activeCounts = await this.assignmentsRepository
      .createQueryBuilder('assignment')
      .select('assignment.teacherId', 'teacherId')
      .addSelect('COUNT(*)', 'count')
      .where('assignment.dateFin IS NULL')
      .groupBy('assignment.teacherId')
      .getRawMany<{ teacherId: string; count: string }>();
    const countByTeacher = new Map(
      activeCounts.map((row) => [row.teacherId, Number(row.count) || 0]),
    );

    return {
      students: students.map((student) => ({
        id: student.id,
        matricule: student.matricule,
        nom: student.user?.nom ?? '',
        prenom: student.user?.prenom ?? '',
        formation: student.formation,
        promotion: student.promotion,
      })),
      teachers: teachers.map((teacher) => ({
        id: teacher.id,
        nom: teacher.nom,
        prenom: teacher.prenom,
        grade: teacher.grade,
        specialite: teacher.specialite,
        assignmentCount: countByTeacher.get(teacher.id) ?? 0,
      })),
    };
  }

  async findAll(dto: FindTeacherAssignmentsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const query = this.assignmentsRepository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.student', 'student')
      .innerJoinAndSelect('student.user', 'studentUser')
      .innerJoinAndSelect('assignment.teacher', 'teacher')
      .leftJoinAndSelect('assignment.assignedBy', 'assignedBy');

    if (dto.studentId)
      query.andWhere('assignment.studentId = :studentId', {
        studentId: dto.studentId,
      });
    if (dto.teacherId)
      query.andWhere('assignment.teacherId = :teacherId', {
        teacherId: dto.teacherId,
      });
    if (dto.formation)
      query.andWhere('LOWER(student.formation) = LOWER(:formation)', {
        formation: dto.formation,
      });
    if (dto.actifOnly) query.andWhere('assignment.dateFin IS NULL');
    if (dto.search) {
      const search = `%${dto.search}%`;
      query.andWhere(
        `(LOWER(studentUser.nom) LIKE LOWER(:search)
          OR LOWER(studentUser.prenom) LIKE LOWER(:search)
          OR LOWER(student.matricule) LIKE LOWER(:search)
          OR LOWER(teacher.nom) LIKE LOWER(:search)
          OR LOWER(teacher.prenom) LIKE LOWER(:search)
          OR LOWER(teacher.email) LIKE LOWER(:search))`,
        { search },
      );
    }

    const [assignments, total] = await query
      .orderBy('assignment.dateAffectation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: assignments.map((assignment) =>
        this.toPublicAssignment(assignment),
      ),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByStudent(studentId: string) {
    const student = await this.findActiveStudent(studentId);
    const assignments = await this.assignmentsRepository.find({
      where: { studentId: student.id },
      relations: { teacher: true },
      order: { dateAffectation: 'DESC' },
    });
    return { data: assignments.map((a) => this.toPublicAssignment(a)) };
  }

  async findByTeacher(teacherId: string) {
    const teacher = await this.findActiveTeacher(teacherId);
    const assignments = await this.assignmentsRepository.find({
      where: { teacherId: teacher.id },
      relations: { student: { user: true } },
      order: { dateAffectation: 'DESC' },
    });
    return {
      data: assignments.map((assignment) => ({
        ...this.toPublicAssignment(assignment),
        student: assignment.student
          ? {
              id: assignment.student.id,
              matricule: assignment.student.matricule,
              nom: assignment.student.user?.nom ?? '',
              prenom: assignment.student.user?.prenom ?? '',
              formation: assignment.student.formation,
              promotion: assignment.student.promotion,
            }
          : undefined,
      })),
    };
  }

  // Etudiants actifs qui n'ont encore aucun tuteur pedagogique : c'est la vue
  // actionnelle de la page admin.
  async findUnassignedStudents() {
    const rows = await this.studentsRepository
      .createQueryBuilder('student')
      .innerJoinAndSelect('student.user', 'user')
      .where('student.dateSuppression IS NULL')
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM teacher_assignments ta
          WHERE ta.student_id = student.id AND ta.date_fin IS NULL
        )`,
      )
      .orderBy('student.matricule', 'ASC')
      .getMany();

    return {
      data: rows.map((student) => ({
        id: student.id,
        matricule: student.matricule,
        nom: student.user?.nom ?? '',
        prenom: student.user?.prenom ?? '',
        formation: student.formation,
        promotion: student.promotion,
      })),
      meta: { total: rows.length },
    };
  }

  async create(dto: CreateTeacherAssignmentDto, actor: AuthenticatedUser) {
    const student = await this.findActiveStudent(dto.studentId);
    const teacher = await this.findActiveTeacher(dto.teacherId);

    // Un etudiant n'a qu'un seul tuteur actif. On refuse explicitement plutot
    // que de remplacer en silence : l'ancien tuteur perdrait l'acces aux
    // stages de cet etudiant sans que l'administrateur l'ait decide.
    const active = await this.assignmentsRepository.findOne({
      where: { studentId: student.id, dateFin: IsNull() },
      relations: { teacher: true },
    });
    if (active)
      throw new ConflictException(
        'Cet étudiant a déjà un tuteur pédagogique actif. Clôturez l’affectation actuelle avant d’en créer une nouvelle.',
      );

    const assignment = this.assignmentsRepository.create({
      studentId: student.id,
      teacherId: teacher.id,
      dateAffectation: new Date(),
      dateFin: null,
      assignedById: actor.id,
    });

    const teacherActiveCount = await this.countActiveForTeacher(teacher.id);
    if (teacherActiveCount >= MAX_STAGIAIRES_PAR_ENCADREUR) {
      throw new ConflictException(
        'Cet encadreur a déjà le nombre maximum d’étudiants actifs (10). Clôturez une affectation avant d’en créer une nouvelle.',
      );
    }

    const saved = await this.saveAndSerialize(assignment);
    await this.syncInternshipsTuteur(student.id);

    const studentUserId = student.userId;
    if (studentUserId) {
      await this.notificationsService.notifyTuteurAssigned({
        studentUserId,
        teacherName: `${teacher.prenom} ${teacher.nom}`,
        assignmentId: saved.id,
      });
    }

    return saved;
  }

  async update(
    id: string,
    dto: UpdateTeacherAssignmentDto,
    actor: AuthenticatedUser,
  ) {
    const assignment = await this.findAssignment(id);

    // Modifier l'étudiant d'une affectation détruirait le couple (étudiant,
    // tuteur) : on le refuse explicitement.
    if (dto.studentId) {
      throw new BadRequestException(
        'Pour changer d’étudiant, clôturez l’affectation et créez-en une nouvelle.',
      );
    }

    // Remplacement direct de l'encadreur sur la même affectation : la date
    // d'affectation d'origine est conservée, mais l'ancien tuteur perd
    // l'accès aux stages via syncInternshipsTuteur.
    let newTeacher: User | null = null;
    if (dto.teacherId) {
      newTeacher = await this.findActiveTeacher(dto.teacherId);
      // Même enseignant : on laisse passer, ça ne change pas l'encadrement.
      // Enseignant différent : on applique la borne de 10 comme dans create().
      if (newTeacher.id !== assignment.teacherId) {
        const teacherActiveCount = await this.countActiveForTeacher(
          newTeacher.id,
        );
        if (teacherActiveCount >= MAX_STAGIAIRES_PAR_ENCADREUR) {
          throw new ConflictException(
            'Cet encadreur a déjà le nombre maximum d’étudiants actifs (10). Clôturez une affectation avant de lui en affecter une nouvelle.',
          );
        }
      }
      assignment.teacher = newTeacher;
      assignment.teacherId = newTeacher.id;
      assignment.assignedById = actor.id;
    }

    if (dto.dateFin !== undefined) {
      const dateFin = new Date(dto.dateFin);
      if (dateFin < assignment.dateAffectation)
        throw new BadRequestException(
          'La date de fin ne peut pas précéder la date d’affectation.',
        );
      assignment.dateFin = dateFin;
    }

    const saved = await this.saveAndSerialize(assignment);
    await this.syncInternshipsTuteur(saved.studentId);

    if (newTeacher && saved.dateFin === null) {
      const studentUserId = assignment.student?.userId;
      if (studentUserId) {
        await this.notificationsService.notifyTuteurAssigned({
          studentUserId,
          teacherName: `${newTeacher.prenom} ${newTeacher.nom}`,
          assignmentId: saved.id,
        });
      }
    }

    return saved;
  }

  async remove(id: string) {
    const assignment = await this.findAssignment(id);
    const studentId = assignment.studentId;

    assignment.dateFin = new Date();
    const saved = await this.saveAndSerialize(assignment);

    await this.syncInternshipsTuteur(studentId);
    return saved;
  }

  // ==========================================================================
  // helpers
  // ==========================================================================

  // Un etudiant n'ayant qu'un seul tuteur actif, son affectation alimente
  // directement internships.tuteur_id. L'ecriture est totale (et non
  // restreinte aux tuteur_id IS NULL) : quand le tuteur change, l'ancien
  // enseignant doit perdre l'acces aux stages de cet etudiant, sinon deux
  // tuteurs cohabitent sur les fiches d'un meme etudiant.
  private async syncInternshipsTuteur(studentId: string) {
    const active = await this.assignmentsRepository.findOne({
      where: { studentId, dateFin: IsNull() },
    });

    if (active) {
      await this.internshipsRepository
        .createQueryBuilder()
        .update(Internship)
        .set({ tuteurId: active.teacherId })
        .where('student_id = :studentId', { studentId })
        .andWhere('date_suppression IS NULL')
        .execute();
      return;
    }

    // Plus aucun tuteur affecte : les stages de cet etudiant sont laisses sans
    // tuteur. L'etudiant apparait alors dans la vue admin « etudiants sans
    // tuteur » pour que l'affectation soit refaite.
    await this.internshipsRepository
      .createQueryBuilder()
      .update(Internship)
      .set({ tuteurId: null })
      .where('student_id = :studentId', { studentId })
      .andWhere('date_suppression IS NULL')
      .execute();
  }

  private async findAssignment(id: string) {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
      relations: { teacher: true, student: true },
    });
    if (!assignment) throw new NotFoundException('Affectation introuvable.');
    return assignment;
  }

  // Nombre d'affectations actives d'un encadreur : sert à appliquer la
  // borne maximale de MAX_STAGIAIRES_PAR_ENCADREUR.
  private async countActiveForTeacher(teacherId: string) {
    return this.assignmentsRepository.count({
      where: { teacherId, dateFin: IsNull() },
    });
  }

  private async findActiveStudent(studentId: string) {
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
      relations: { user: true },
    });
    if (!student || student.dateSuppression)
      throw new NotFoundException('Étudiant introuvable.');
    return student;
  }

  // Passe par UsersService.findActiveById : un enseignant desactive ne peut
  // pas devenir tuteur (l'ancien findTuteur de internships.service.ts
  // ignorait le drapeau actif).
  private async findActiveTeacher(teacherId: string) {
    const teacher = await this.usersService.findActiveById(teacherId);
    if (!teacher)
      throw new NotFoundException('Enseignant introuvable ou désactivé.');
    if (teacher.role !== Role.ENSEIGNANT)
      throw new BadRequestException(
        'Le tuteur pédagogique doit être un enseignant actif.',
      );
    return teacher;
  }

  private async saveAndSerialize(assignment: TeacherAssignment) {
    try {
      const saved = await this.assignmentsRepository.save(assignment);
      return this.toPublicAssignment(saved);
    } catch (error) {
      const driverError = (error as QueryFailedError).driverError as
        { code?: string; constraint?: string } | undefined;
      if (error instanceof QueryFailedError && driverError?.code === '23505') {
        throw new ConflictException(
          'Cet étudiant a déjà un tuteur pédagogique actif. Clôturez l’affectation actuelle avant d’en créer une nouvelle.',
        );
      }
      if (error instanceof QueryFailedError && driverError?.code === '23514') {
        throw new BadRequestException(
          'La date de fin ne peut pas précéder la date d’affectation.',
        );
      }
      throw error;
    }
  }

  private toPublicTeacher(assignment: TeacherAssignment) {
    return {
      id: assignment.teacher.id,
      nom: assignment.teacher.nom,
      prenom: assignment.teacher.prenom,
      grade: assignment.teacher.grade,
      specialite: assignment.teacher.specialite,
      email: assignment.teacher.email,
      dateAffectation: assignment.dateAffectation,
      assignmentId: assignment.id,
    };
  }

  private toPublicAssignment(assignment: TeacherAssignment) {
    return {
      id: assignment.id,
      studentId: assignment.studentId,
      teacherId: assignment.teacherId,
      dateAffectation: assignment.dateAffectation,
      dateFin: assignment.dateFin,
      student: assignment.student
        ? {
            id: assignment.student.id,
            matricule: assignment.student.matricule,
            nom: assignment.student.user?.nom ?? '',
            prenom: assignment.student.user?.prenom ?? '',
            formation: assignment.student.formation,
            promotion: assignment.student.promotion,
          }
        : undefined,
      teacher: assignment.teacher
        ? {
            id: assignment.teacher.id,
            nom: assignment.teacher.nom,
            prenom: assignment.teacher.prenom,
            grade: assignment.teacher.grade,
            specialite: assignment.teacher.specialite,
            email: assignment.teacher.email,
          }
        : undefined,
      assignedBy: assignment.assignedBy
        ? {
            id: assignment.assignedBy.id,
            nom: assignment.assignedBy.nom,
            prenom: assignment.assignedBy.prenom,
          }
        : undefined,
      // true quand la ligne vient du backfill de migration (assigned_by NULL).
      fromBackfill: assignment.assignedById === null,
    };
  }
}
