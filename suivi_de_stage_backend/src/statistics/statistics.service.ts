import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { Internship } from '../internships/entities/internship.entity';
import { InternshipStatus } from '../internships/enums/internship-status.enum';
import { Student } from '../students/entities/student.entity';
import { AcademicStatus } from '../students/enums/academic-status.enum';
import { Role } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { ProfessionalSituation } from '../professional-situations/entities/professional-situation.entity';
import { ProfessionalSituationType } from '../professional-situations/enums/professional-situation-type.enum';
import { FindStatisticsDto } from './dto/find-statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    @InjectRepository(ProfessionalSituation)
    private readonly situationsRepository: Repository<ProfessionalSituation>,
    @InjectRepository(Evaluation)
    private readonly evaluationsRepository: Repository<Evaluation>,
  ) {}

  async getDashboard(dto?: FindStatisticsDto) {
    const period = Boolean(dto?.debut || dto?.fin);
    const hasPromotion = Boolean(dto?.promotion);

    const [
      students,
      supervisors,
      companies,
      internships,
      upcoming,
      ongoing,
      completed,
      employment,
      [byYear, byCity],
      promotions,
    ] = await Promise.all([
      hasPromotion && dto
        ? this.studentsRepository.count({ where: { promotion: dto.promotion } })
        : period
          ? this.countInternshipStudents(dto)
          : this.studentsRepository.count(),
      period
        ? this.countInternshipSupervisors(dto)
        : this.usersRepository.count({
            where: { role: Role.ENCADREUR, actif: true },
          }),
      period
        ? this.countInternshipCompanies(dto)
        : this.companiesRepository.count(),
      this.countInternships(dto),
      this.countInternships(dto, InternshipStatus.A_VENIR),
      this.countInternships(dto, InternshipStatus.EN_COURS),
      this.countInternships(dto, InternshipStatus.TERMINE),
      this.getEmploymentStatistics(),
      Promise.all([
        this.groupBy('EXTRACT(YEAR FROM internship.date_debut)', 'year', dto),
        this.groupBy('internship.ville', 'city', dto),
      ]),
      this.getPromotions(),
    ]);

    return {
      counts: { students, supervisors, companies, internships },
      internships: { upcoming, ongoing, completed },
      employment,
      statusData: [
        { name: 'En attente', value: upcoming },
        { name: 'En cours', value: ongoing },
        { name: 'Terminé', value: completed },
      ],
      byYear,
      byCity,
      promotions,
    };
  }

  private async getPromotions() {
    const rows = await this.studentsRepository
      .createQueryBuilder('student')
      .select('DISTINCT student.promotion', 'promotion')
      .where('student.promotion IS NOT NULL')
      .orderBy('student.promotion', 'DESC')
      .getRawMany<{ promotion: string }>();
    return rows.map((r) => r.promotion).filter(Boolean);
  }

  async getInternshipStatistics(dto?: FindStatisticsDto) {
    const [byYear, byDomain, byCity] = await Promise.all([
      this.groupBy('EXTRACT(YEAR FROM internship.date_debut)', 'year', dto),
      this.groupBy('internship.domaine', 'domain', dto),
      this.groupBy('internship.ville', 'city', dto),
    ]);
    return { byYear, byDomain, byCity };
  }

  async getOverview(dto?: FindStatisticsDto) {
    const [byMonth, topCompanies, byNiveau, evalDist] = await Promise.all([
      this.getMonthlySeries(dto),
      this.getTopCompanies(dto),
      this.getStudentsByNiveau(dto),
      this.getEvaluationDistribution(dto),
    ]);
    return { byMonth, topCompanies, byNiveau, evalDist };
  }

  async getEmploymentStatistics() {
    const graduates = await this.studentsRepository.count({
      where: { statutAcademique: AcademicStatus.DIPLOME },
    });
    const latestSituations = await this.situationsRepository
      .createQueryBuilder('situation')
      .innerJoin(Student, 'student', 'student.id = situation.student_id')
      .where('student.statut_academique = :status', {
        status: AcademicStatus.DIPLOME,
      })
      .andWhere(
        `situation.date_creation = (
          SELECT MAX(previous.date_creation)
          FROM professional_situations previous
          WHERE previous.student_id = situation.student_id
        )`,
      )
      .getMany();
    const bySituation = latestSituations.reduce<Record<string, number>>(
      (counts, situation) => {
        counts[situation.situation] = (counts[situation.situation] ?? 0) + 1;
        return counts;
      },
      {},
    );
    const employed = bySituation[ProfessionalSituationType.EMPLOYE] ?? 0;
    const seekingEmployment =
      bySituation[ProfessionalSituationType.EN_RECHERCHE_EMPLOI] ?? 0;
    return {
      graduates,
      employed,
      seekingEmployment,
      bySituation,
      insertionRate:
        graduates === 0 ? 0 : Number(((employed / graduates) * 100).toFixed(2)),
    };
  }

  async getGeographyStatistics() {
    const [byCity, coordinates] = await Promise.all([
      this.groupBy('internship.ville', 'city'),
      this.internshipsRepository
        .createQueryBuilder('internship')
        .select('internship.ville', 'city')
        .addSelect('internship.latitude', 'latitude')
        .addSelect('internship.longitude', 'longitude')
        .where(
          'internship.latitude IS NOT NULL AND internship.longitude IS NOT NULL',
        )
        .groupBy('internship.ville')
        .addGroupBy('internship.latitude')
        .addGroupBy('internship.longitude')
        .getRawMany(),
    ]);
    return { byCity, coordinates };
  }

  /** Applique le filtre de période sur internship.date_debut (bornes inclusives). */
  private applyPeriod(
    query: { andWhere: (sql: string, params?: object) => unknown },
    alias: string,
    dto?: FindStatisticsDto,
  ) {
    if (dto?.debut) {
      query.andWhere(`${alias}.date_debut >= :debut`, { debut: dto.debut });
    }
    if (dto?.fin) {
      query.andWhere(`${alias}.date_debut <= :fin`, { fin: dto.fin });
    }
  }

  private async countInternships(
    dto?: FindStatisticsDto,
    statut?: InternshipStatus,
  ) {
    const qb = this.internshipsRepository.createQueryBuilder('internship');
    this.applyPeriod(qb, 'internship', dto);
    if (statut) {
      qb.andWhere('internship.statut = :statut', { statut });
    }
    return qb.getCount();
  }

  private async countDistinctInternshipField(
    field: 'student_id' | 'company_id' | 'supervisor_id',
    dto?: FindStatisticsDto,
  ) {
    const qb = this.internshipsRepository
      .createQueryBuilder('internship')
      .select(`COUNT(DISTINCT internship.${field})`, 'count');
    this.applyPeriod(qb, 'internship', dto);
    const row = await qb.getRawOne<{ count: string }>();
    return Number(row?.count) || 0;
  }

  private countInternshipStudents(dto?: FindStatisticsDto) {
    return this.countDistinctInternshipField('student_id', dto);
  }

  private countInternshipCompanies(dto?: FindStatisticsDto) {
    return this.countDistinctInternshipField('company_id', dto);
  }

  private countInternshipSupervisors(dto?: FindStatisticsDto) {
    return this.countDistinctInternshipField('supervisor_id', dto);
  }

  private async groupBy(
    expression: string,
    alias: string,
    dto?: FindStatisticsDto,
  ) {
    const qb = this.internshipsRepository
      .createQueryBuilder('internship')
      .select(expression, alias)
      .addSelect('COUNT(internship.id)', 'count');
    this.applyPeriod(qb, 'internship', dto);
    const rows = await qb
      .groupBy(expression)
      .orderBy('count', 'DESC')
      .getRawMany<{ [key: string]: string }>();
    return rows.map((row) => ({
      [alias]: alias === 'year' ? Number(row[alias]) : row[alias],
      count: Number(row.count),
    }));
  }

  private async groupByMonth(
    statut?: InternshipStatus,
    dto?: FindStatisticsDto,
  ) {
    const qb = this.internshipsRepository
      .createQueryBuilder('internship')
      .select(`TO_CHAR(internship.date_debut, 'YYYY-MM')`, 'month')
      .addSelect('COUNT(internship.id)', 'count');
    if (statut) {
      qb.where('internship.statut = :statut', { statut });
    }
    this.applyPeriod(qb, 'internship', dto);
    const rows = await qb
      .groupBy(`TO_CHAR(internship.date_debut, 'YYYY-MM')`)
      .getRawMany<{ month: string; count: string }>();
    return rows.map((row) => ({ month: row.month, count: Number(row.count) }));
  }

  private async getMonthlySeries(dto?: FindStatisticsDto) {
    const [created, completed] = await Promise.all([
      this.groupByMonth(undefined, dto),
      this.groupByMonth(InternshipStatus.TERMINE, dto),
    ]);
    const merged = new Map<string, { crees: number; termines: number }>();
    for (const row of created) {
      merged.set(row.month, { crees: row.count, termines: 0 });
    }
    for (const row of completed) {
      const entry = merged.get(row.month) ?? { crees: 0, termines: 0 };
      entry.termines = row.count;
      merged.set(row.month, entry);
    }
    return [...merged.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mois, value]) => ({ mois, ...value }));
  }

  private async getTopCompanies(dto?: FindStatisticsDto) {
    const qb = this.internshipsRepository
      .createQueryBuilder('internship')
      .innerJoin('internship.company', 'company')
      .select('company.nom', 'nom')
      .addSelect('company.ville', 'ville')
      .addSelect('company.secteur_activite', 'secteur')
      .addSelect('COUNT(internship.id)', 'stages');
    this.applyPeriod(qb, 'internship', dto);
    const rows = await qb
      .groupBy('company.id')
      .addGroupBy('company.nom')
      .addGroupBy('company.ville')
      .addGroupBy('company.secteur_activite')
      .orderBy('stages', 'DESC')
      .take(5)
      .getRawMany<{ nom: string; ville: string; secteur: string; stages: string }>();
    return rows.map((row) => ({
      nom: row.nom,
      ville: row.ville,
      secteur: row.secteur,
      stages: Number(row.stages),
    }));
  }

  private async getStudentsByNiveau(dto?: FindStatisticsDto) {
    const qb = this.studentsRepository
      .createQueryBuilder('student')
      .select('student.niveau', 'niveau')
      .addSelect('COUNT(student.id)', 'count');
    if (dto?.promotion) {
      qb.andWhere('student.promotion = :promotion', { promotion: dto.promotion });
    } else if (dto?.debut || dto?.fin) {
      const params: Record<string, string> = {};
      let subquery =
        'EXISTS (SELECT 1 FROM internships i WHERE i.student_id = student.id';
      if (dto.debut) {
        subquery += ' AND i.date_debut >= :debut';
        params.debut = dto.debut;
      }
      if (dto.fin) {
        subquery += ' AND i.date_debut <= :fin';
        params.fin = dto.fin;
      }
      subquery += ')';
      qb.andWhere(subquery).setParameters(params);
    }
    const rows = await qb
      .groupBy('student.niveau')
      .orderBy('student.niveau', 'ASC')
      .getRawMany<{ niveau: string; count: string }>();
    return rows.map((row) => ({
      niveau: row.niveau,
      count: Number(row.count),
    }));
  }

  private async getEvaluationDistribution(dto?: FindStatisticsDto) {
    const qb = this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .innerJoin('evaluation.stage', 'internship')
      .select('evaluation.note', 'note');
    this.applyPeriod(qb, 'internship', dto);
    const rows = await qb.getRawMany<{ note: string }>();
    const buckets = ['0-4', '5-9', '10-14', '15-20'];
    const counts: Record<string, number> = { '0-4': 0, '5-9': 0, '10-14': 0, '15-20': 0 };
    for (const row of rows) {
      const note = Number(row.note);
      const bucket =
        note <= 4 ? '0-4' : note <= 9 ? '5-9' : note <= 14 ? '10-14' : '15-20';
      counts[bucket] = (counts[bucket] ?? 0) + 1;
    }
    return buckets.map((note) => ({ note, count: counts[note] }));
  }
}