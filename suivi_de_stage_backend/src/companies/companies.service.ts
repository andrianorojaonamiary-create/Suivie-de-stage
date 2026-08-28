import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Role } from '../users/enums/role.enum';
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
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateCompanyDto, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    const user = await this.findCompanyUser(dto.userId);
    const company = this.companiesRepository.create({ ...dto, user });
    return this.saveAndSerialize(company);
  }

  async findAll(dto: FindCompaniesDto, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const query = this.companiesRepository
      .createQueryBuilder('company')
      .innerJoinAndSelect('company.user', 'user');

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
    this.ensureCanAccess(company, actor);
    return this.toPublicCompany(company);
  }

  async findMe(actor: AuthenticatedUser) {
    this.ensureCompany(actor);
    return this.toPublicCompany(await this.findByUserId(actor.id));
  }

  async update(id: string, dto: UpdateCompanyDto, actor: AuthenticatedUser) {
    const company = await this.findEntity(id);
    this.ensureCanAccess(company, actor);
    if (actor.role !== Role.ADMINISTRATEUR && (dto.userId || dto.statut)) {
      throw new ForbiddenException(
        'Seul un administrateur peut modifier le compte ou le statut.',
      );
    }
    if (dto.userId) {
      company.user = await this.findCompanyUser(dto.userId);
      company.userId = dto.userId;
    }
    Object.assign(company, dto);
    return this.saveAndSerialize(company);
  }

  async deactivate(id: string, actor: AuthenticatedUser) {
    this.ensureAdmin(actor);
    const company = await this.findEntity(id);
    company.statut = CompanyStatus.INACTIVE;
    return this.saveAndSerialize(company);
  }

  async findHostedStudents(id: string, actor: AuthenticatedUser) {
    const company = await this.findEntity(id);
    this.ensureCanAccess(company, actor);
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

  private async findCompanyUser(id: string) {
    const user = await this.usersService.findActiveById(id);
    if (!user || user.role !== Role.ENTREPRISE)
      throw new NotFoundException('Compte entreprise introuvable.');
    return user;
  }

  private ensureAdmin(actor: AuthenticatedUser) {
    if (actor.role !== Role.ADMINISTRATEUR)
      throw new ForbiddenException(
        'Seul un administrateur peut effectuer cette action.',
      );
  }

  private ensureCompany(actor: AuthenticatedUser) {
    if (actor.role !== Role.ENTREPRISE && actor.role !== Role.ADMINISTRATEUR)
      throw new ForbiddenException('Accès réservé aux entreprises.');
  }

  private ensureCanAccess(company: Company, actor: AuthenticatedUser) {
    if (
      actor.role !== Role.ADMINISTRATEUR &&
      (actor.role !== Role.ENTREPRISE || company.userId !== actor.id)
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez pas consulter cette entreprise.',
      );
    }
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
    };
  }
}
