import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Internship } from '../internships/entities/internship.entity';
import { Role } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { FindCompaniesDto } from './dto/find-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { CompanyStatus } from './enums/company-status.enum';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateCompanyDto, actor: AuthenticatedUser) {
    let ownerId: string;
    let ownerUser: User | null = null;
    if (actor.role === Role.ENCADREUR || actor.role === Role.ETUDIANT) {
      ownerId = actor.id;
      ownerUser = (await this.usersService.findActiveById(actor.id)) ?? null;
    } else {
      this.ensureAdmin(actor);
      if (!dto.userId) {
        throw new BadRequestException(
          'Le champ userId est requis pour un administrateur.',
        );
      }
      ownerId = dto.userId;
      ownerUser = await this.findCompanyOwner(ownerId);
    }
    if (!ownerUser) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
    const company = this.companiesRepository.create({
      ...dto,
      userId: ownerId,
      user: ownerUser,
      region: dto.region ?? dto.ville ?? 'Non renseignée',
    });
    return this.saveAndSerialize(company);
  }

  async findAll(dto: FindCompaniesDto, actor: AuthenticatedUser) {
    const canList =
      actor.role === Role.ADMINISTRATEUR || actor.role === Role.ETUDIANT;
    if (!canList) {
      throw new ForbiddenException(
        'Accès réservé aux administrateurs et étudiants.',
      );
    }
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const query = this.companiesRepository
      .createQueryBuilder('company')
      .innerJoinAndSelect('company.user', 'user')
      .leftJoin('internships', 'internship', 'internship.company_id = company.id')
      .addSelect('COUNT(internship.id)', 'internshipsCount')
      .groupBy('company.id, user.id');

    if (actor.role === Role.ETUDIANT) {
      query.andWhere('company.statut = :statut', {
        statut: CompanyStatus.ACTIVE,
      });
    }

    if (dto.ville)
      query.andWhere('LOWER(company.ville) = LOWER(:ville)', {
        ville: dto.ville,
      });
    if (dto.region)
      query.andWhere('LOWER(company.region) = LOWER(:region)', {
        region: dto.region,
      });
    if (dto.secteurActivite)
      query.andWhere('LOWER(company.secteur_activite) LIKE LOWER(:secteur)', {
        secteur: `%${dto.secteurActivite}%`,
      });
    if (dto.statut)
      query.andWhere('company.statut = :statut', { statut: dto.statut });
    if (dto.search) {
      query.andWhere(
        '(LOWER(company.nom) LIKE LOWER(:search) OR LOWER(company.email) LIKE LOWER(:search) OR LOWER(company.ville) LIKE LOWER(:search) OR LOWER(company.secteur_activite) LIKE LOWER(:search))',
        { search: `%${dto.search}%` },
      );
    }

    const [companies, total] = await query
      .orderBy('company.dateCreation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: companies.map((company) => this.toPublicCompany(company)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const company = await this.findEntity(id);
    await this.ensureCanRead(company, actor);
    return this.toPublicCompany(company);
  }

  async findMe(actor: AuthenticatedUser) {
    let company: Company;
    if (actor.role === Role.ENCADREUR) {
      try {
        company = await this.findByUserId(actor.id);
      } catch (error) {
        if (!(error instanceof NotFoundException)) throw error;
        company = await this.findByEncadreur(actor.id);
      }
    } else {
      company = await this.findByUserId(actor.id);
    }
    return this.toPublicCompany(company);
  }

  async findSupervisedCompanies(actor: AuthenticatedUser) {
    const internships = await this.internshipsRepository.find({
      where: { supervisor: { userId: actor.id } },
      relations: { company: { user: true } },
      order: { dateCreation: 'DESC' },
    });
    const seen = new Set<string>();
    const companies = [];
    for (const internship of internships) {
      const company = internship.company;
      if (!company || seen.has(company.id)) continue;
      seen.add(company.id);
      companies.push(this.toPublicCompany(company));
    }
    return { data: companies };
  }

  async update(id: string, dto: UpdateCompanyDto, actor: AuthenticatedUser) {
    const company = await this.findEntity(id);
    await this.ensureCanAccess(company, actor);
    if (actor.role !== Role.ADMINISTRATEUR && (dto.userId || dto.statut)) {
      throw new ForbiddenException(
        'Seul un administrateur peut modifier le compte ou le statut.',
      );
    }
    if (dto.userId) {
      company.user = await this.findCompanyOwner(dto.userId);
      company.userId = dto.userId;
    }
    Object.assign(company, dto);
    return this.saveAndSerialize(company);
  }

  async deactivate(id: string, actor: AuthenticatedUser) {
    const company = await this.findEntity(id);
    if (actor.role !== Role.ADMINISTRATEUR && company.userId !== actor.id) {
      throw new ForbiddenException(
        'Seul un administrateur ou le propriétaire peut désactiver cette entreprise.',
      );
    }
    company.statut = CompanyStatus.INACTIVE;
    return this.saveAndSerialize(company);
  }

  async findHostedStudents(id: string, actor: AuthenticatedUser) {
    const company = await this.findEntity(id);
    await this.ensureCanAccess(company, actor);
    const students = await this.studentsRepository.find({
      where: { entrepriseId: company.userId },
      relations: { user: true },
      order: { dateCreation: 'DESC' },
    });
    return students.map((student) => ({
      id: student.id,
      matricule: student.matricule,
      formation: student.formation,
      niveau: student.niveau,
      promotion: student.promotion,
      statutAcademique: student.statutAcademique,
      user: student.user
        ? {
            id: student.user.id,
            nom: student.user.nom,
            prenom: student.user.prenom,
          }
        : undefined,
    }));
  }

  private async findEntity(id: string) {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!company) throw new NotFoundException('Entreprise introuvable.');
    return company;
  }

  private async findByUserId(userId: string) {
    const company = await this.companiesRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
    if (!company) throw new NotFoundException('Profil entreprise introuvable.');
    return company;
  }

  private async findByEncadreur(encadreurId: string) {
    const student = await this.studentsRepository.findOne({
      where: { encadreurId },
      order: { dateCreation: 'ASC' },
    });
    if (!student?.entrepriseId) {
      throw new NotFoundException(
        'Aucune entreprise associée à cet encadreur.',
      );
    }
    const company = await this.companiesRepository.findOne({
      where: { userId: student.entrepriseId },
      relations: { user: true },
    });
    if (!company)
      throw new NotFoundException(
        'Aucune entreprise associée à cet encadreur.',
      );
    return company;
  }

  private async findCompanyOwner(id: string) {
    const user = await this.usersService.findActiveById(id);
    if (!user || user.role !== Role.ENCADREUR)
      throw new NotFoundException('Encadreur introuvable.');
    return user;
  }

  private ensureAdmin(actor: AuthenticatedUser) {
    if (actor.role !== Role.ADMINISTRATEUR)
      throw new ForbiddenException(
        'Seul un administrateur peut effectuer cette action.',
      );
  }

  private async ensureCanAccess(company: Company, actor: AuthenticatedUser) {
    if (actor.role === Role.ADMINISTRATEUR || company.userId === actor.id) {
      return;
    }
    if (actor.role === Role.ENCADREUR) {
      const assignedStudent = await this.studentsRepository.findOne({
        where: { encadreurId: actor.id, entrepriseId: company.userId },
        select: { id: true },
      });
      if (assignedStudent) return;
    }
    throw new ForbiddenException(
      'Vous ne pouvez pas consulter cette entreprise.',
    );
  }

  private async ensureCanRead(company: Company, actor: AuthenticatedUser) {
    if (actor.role === Role.ADMINISTRATEUR || company.userId === actor.id) {
      return;
    }
    if (actor.role === Role.ENCADREUR) {
      const assignedStudent = await this.studentsRepository.findOne({
        where: { encadreurId: actor.id, entrepriseId: company.userId },
        select: { id: true },
      });
      if (assignedStudent) return;
    }
    throw new ForbiddenException(
      'Vous ne pouvez pas consulter cette entreprise.',
    );
  }

  private async saveAndSerialize(company: Company) {
    try {
      return this.toPublicCompany(await this.companiesRepository.save(company));
    } catch (error) {
      const driverError = (error as QueryFailedError).driverError as
        { code?: string } | undefined;
      if (error instanceof QueryFailedError && driverError?.code === '23505') {
        throw new ConflictException(
          'Ce compte ou cet email possède déjà une entreprise.',
        );
      }
      throw error;
    }
  }

  private toPublicCompany(company: Company) {
    const rawCompany = company as Company & { internshipsCount?: string };
    return {
      id: company.id,
      nom: company.nom,
      description: company.description,
      secteurActivite: company.secteurActivite,
      adresse: company.adresse,
      ville: company.ville,
      region: company.region,
      telephone: company.telephone,
      email: company.email,
      siteWeb: company.siteWeb,
      latitude: company.latitude,
      longitude: company.longitude,
      statut: company.statut,
      user: company.user
        ? {
            id: company.user.id,
            nom: company.user.nom,
            prenom: company.user.prenom,
            email: company.user.email,
            role: company.user.role,
          }
        : undefined,
      dateCreation: company.dateCreation,
      dateModification: company.dateModification,
      internshipsCount: rawCompany.internshipsCount ? parseInt(rawCompany.internshipsCount, 10) : 0,
    };
  }
}
