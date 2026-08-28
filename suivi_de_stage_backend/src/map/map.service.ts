import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Internship } from '../internships/entities/internship.entity';
import { Role } from '../users/enums/role.enum';
import { FindMapDto } from './dto/find-map.dto';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async findInternshipPoints(filters: FindMapDto, actor: AuthenticatedUser) {
    const query = this.internshipsRepository
      .createQueryBuilder('internship')
      .innerJoin('internship.company', 'company')
      .innerJoin('internship.student', 'student')
      .innerJoin('internship.supervisor', 'supervisor')
      .select([
        'internship.id AS id',
        'company.id AS "companyId"',
        'company.nom AS "nomEntreprise"',
        'internship.latitude AS latitude',
        'internship.longitude AS longitude',
        'internship.ville AS ville',
        'company.region AS region',
        'internship.domaine AS domaine',
        'internship.statut AS statut',
        'internship.intitule AS intitule',
        'internship.description AS description',
        'internship.lieu AS lieu',
        'internship.date_debut AS "dateDebut"',
        'internship.date_fin AS "dateFin"',
      ])
      .where('internship.latitude IS NOT NULL')
      .andWhere('internship.longitude IS NOT NULL');

    this.applyInternshipAccess(query, actor);
    this.applyFilters(query, filters, 'internship', 'company', 'student');

    const points = await query
      .orderBy('internship.date_debut', 'DESC')
      .limit(filters.limit ?? 500)
      .getRawMany();

    return points.map((point) => ({
      id: point.id,
      companyId: point.companyId,
      nomEntreprise: point.nomEntreprise,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
      ville: point.ville,
      region: point.region,
      domaine: point.domaine,
      statut: point.statut,
      intitule: point.intitule,
      description: point.description,
      lieu: point.lieu,
      dateDebut: point.dateDebut,
      dateFin: point.dateFin,
    }));
  }

  async findCompanyPoints(filters: FindMapDto) {
    const query = this.companiesRepository
      .createQueryBuilder('company')
      .leftJoin(
        'internships',
        'internship',
        'internship.company_id = company.id AND internship.date_suppression IS NULL',
      )
      .leftJoin('students', 'student', 'student.id = internship.student_id')
      .select([
        'company.id AS id',
        'company.nom AS nom',
        'company.latitude AS latitude',
        'company.longitude AS longitude',
        'company.ville AS ville',
        'company.region AS region',
        'company.secteur_activite AS "secteurActivite"',
        'company.statut AS statut',
        'COUNT(DISTINCT internship.id) AS "nombreStages"',
      ])
      .where('company.latitude IS NOT NULL')
      .andWhere('company.longitude IS NOT NULL');

    this.applyFilters(query, filters, 'internship', 'company', 'student');

    const points = await query
      .groupBy('company.id')
      .orderBy('company.nom', 'ASC')
      .limit(filters.limit ?? 500)
      .getRawMany();

    return points.map((point) => ({
      id: point.id,
      nom: point.nom,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
      ville: point.ville,
      region: point.region,
      secteurActivite: point.secteurActivite,
      statut: point.statut,
      nombreStages: Number(point.nombreStages),
    }));
  }

  private applyFilters(
    query: SelectQueryBuilder<ObjectLiteral>,
    filters: FindMapDto,
    internshipAlias: string,
    companyAlias: string,
    studentAlias: string,
  ) {
    if (filters.ville) {
      query.andWhere(
        `(LOWER(${internshipAlias}.ville) = LOWER(:ville) OR LOWER(${companyAlias}.ville) = LOWER(:ville))`,
        { ville: filters.ville },
      );
    }
    if (filters.region) {
      query.andWhere(`LOWER(${companyAlias}.region) = LOWER(:region)`, {
        region: filters.region,
      });
    }
    if (filters.domaine) {
      query.andWhere(
        `(LOWER(${internshipAlias}.domaine) LIKE LOWER(:domaine) OR LOWER(${companyAlias}.secteur_activite) LIKE LOWER(:domaine))`,
        { domaine: `%${filters.domaine}%` },
      );
    }
    if (filters.promotion) {
      query.andWhere(`student.promotion = :promotion`, {
        promotion: filters.promotion,
      });
    }
    if (filters.statut) {
      query.andWhere(`${internshipAlias}.statut = :statut`, {
        statut: filters.statut,
      });
    }
  }

  private applyInternshipAccess(
    query: SelectQueryBuilder<Internship>,
    actor: AuthenticatedUser,
  ) {
    if (actor.role === Role.ETUDIANT) {
      query.andWhere('student.user_id = :actorId', { actorId: actor.id });
    } else if (actor.role === Role.ENTREPRISE) {
      query.andWhere('company.user_id = :actorId', { actorId: actor.id });
    } else if (actor.role === Role.ENCADREUR) {
      query.andWhere('supervisor.user_id = :actorId', { actorId: actor.id });
    }
  }
}
