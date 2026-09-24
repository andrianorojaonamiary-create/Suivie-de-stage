import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { Internship } from '../internships/entities/internship.entity';
import { InternshipStatus } from '../internships/enums/internship-status.enum';
import { Student } from '../students/entities/student.entity';
import { AcademicStatus } from '../students/enums/academic-status.enum';
import { Role } from '../users/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { ProfessionalSituation } from '../professional-situations/entities/professional-situation.entity';
import { ProfessionalSituationType } from '../professional-situations/enums/professional-situation-type.enum';

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
  ) {}

  async getDashboard() {
    const [
      students,
      supervisors,
      companies,
      internships,
      upcoming,
      ongoing,
      completed,
      employment,
    ] = await Promise.all([
      this.studentsRepository.count(),
      this.usersRepository.count({
        where: { role: Role.ENCADREUR, actif: true },
      }),
      this.companiesRepository.count(),
      this.internshipsRepository.count(),
      this.internshipsRepository.count({
        where: { statut: InternshipStatus.A_VENIR },
      }),
      this.internshipsRepository.count({
        where: { statut: InternshipStatus.EN_COURS },
      }),
      this.internshipsRepository.count({
        where: { statut: InternshipStatus.TERMINE },
      }),
      this.getEmploymentStatistics(),
    ]);

    return {
      counts: { students, supervisors, companies, internships },
      internships: { upcoming, ongoing, completed },
      employment,
    };
  }

  async getInternshipStatistics() {
    const [byYear, byDomain, byCity] = await Promise.all([
      this.groupBy('EXTRACT(YEAR FROM internship.date_debut)', 'year'),
      this.groupBy('internship.domaine', 'domain'),
      this.groupBy('internship.ville', 'city'),
    ]);
    return { byYear, byDomain, byCity };
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

  private async groupBy(expression: string, alias: string) {
    const rows = await this.internshipsRepository
      .createQueryBuilder('internship')
      .select(expression, alias)
      .addSelect('COUNT(internship.id)', 'count')
      .groupBy(expression)
      .orderBy('count', 'DESC')
      .getRawMany<{ [key: string]: string }>();
    return rows.map((row) => ({
      [alias]: alias === 'year' ? Number(row[alias]) : row[alias],
      count: Number(row.count),
    }));
  }
}
