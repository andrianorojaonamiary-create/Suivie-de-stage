import { StatisticsService } from './statistics.service';
import { AcademicStatus } from '../students/enums/academic-status.enum';
import { ProfessionalSituationType } from '../professional-situations/enums/professional-situation-type.enum';
import { InternshipStatus } from '../internships/enums/internship-status.enum';
import { Role } from '../users/enums/role.enum';

describe('StatisticsService', () => {
  const usersRepository = {
    count: jest.fn(),
  };
  const studentsRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const companiesRepository = {
    count: jest.fn(),
  };
  const internshipsRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const situationsRepository = {
    createQueryBuilder: jest.fn(),
  };
  const evaluationsRepository = {
    createQueryBuilder: jest.fn(),
  };

  let service: StatisticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StatisticsService(
      usersRepository as never,
      studentsRepository as never,
      companiesRepository as never,
      internshipsRepository as never,
      situationsRepository as never,
      evaluationsRepository as never,
    );
  });

  it('returns dashboard counters and stage status counts', async () => {
    studentsRepository.count.mockResolvedValueOnce(12);
    usersRepository.count.mockResolvedValueOnce(4);
    companiesRepository.count.mockResolvedValueOnce(8);
    const internshipTotalQb = {
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(20),
    };
    const upcomingQb = {
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(5),
    };
    const ongoingQb = {
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(10),
    };
    const terminatedQb = {
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(5),
    };
    const yearQuery = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([
          { year: '2024', count: '6' },
          { year: '2025', count: '4' },
        ]),
    };
    const cityQuery = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([
          { city: 'Antananarivo', count: '8' },
          { city: 'Fianarantsoa', count: '3' },
        ]),
    };
    const promotionsQb = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { promotion: '2025' },
        { promotion: '2024' },
        { promotion: '2023' },
      ]),
    };
    (internshipsRepository.createQueryBuilder as jest.Mock)
      .mockReturnValueOnce(internshipTotalQb)
      .mockReturnValueOnce(upcomingQb)
      .mockReturnValueOnce(ongoingQb)
      .mockReturnValueOnce(terminatedQb)
      .mockReturnValueOnce(yearQuery)
      .mockReturnValueOnce(cityQuery);
    (studentsRepository.createQueryBuilder as jest.Mock).mockReturnValueOnce(
      promotionsQb,
    );
    jest.spyOn(service, 'getEmploymentStatistics').mockResolvedValue({
      graduates: 6,
      employed: 4,
      seekingEmployment: 1,
      bySituation: { EMPLOYE: 4, EN_RECHERCHE_EMPLOI: 1 },
      insertionRate: 66.67,
    });

    await expect(service.getDashboard()).resolves.toEqual({
      counts: { students: 12, supervisors: 4, companies: 8, internships: 20 },
      internships: { upcoming: 5, ongoing: 10, completed: 5 },
      employment: {
        graduates: 6,
        employed: 4,
        seekingEmployment: 1,
        bySituation: { EMPLOYE: 4, EN_RECHERCHE_EMPLOI: 1 },
        insertionRate: 66.67,
      },
      statusData: [
        { name: 'En attente', value: 5 },
        { name: 'En cours', value: 10 },
        { name: 'Terminé', value: 5 },
      ],
      byYear: [
        { year: 2024, count: 6 },
        { year: 2025, count: 4 },
      ],
      byCity: [
        { city: 'Antananarivo', count: 8 },
        { city: 'Fianarantsoa', count: 3 },
      ],
      promotions: ['2025', '2024', '2023'],
    });
    expect(usersRepository.count).toHaveBeenCalledWith({
      where: { role: Role.ENCADREUR, actif: true },
    });
    expect(terminatedQb.andWhere).toHaveBeenCalledWith(
      'internship.statut = :statut',
      { statut: InternshipStatus.TERMINE },
    );
    expect(internshipTotalQb.getCount).toHaveBeenCalled();
  });

  it('calculates employment from each graduate latest situation', async () => {
    studentsRepository.count.mockResolvedValue(4);
    const query = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest
        .fn()
        .mockResolvedValue([
          { situation: ProfessionalSituationType.EMPLOYE },
          { situation: ProfessionalSituationType.EMPLOYE },
          { situation: ProfessionalSituationType.EN_RECHERCHE_EMPLOI },
        ]),
    };
    situationsRepository.createQueryBuilder.mockReturnValue(query);

    await expect(service.getEmploymentStatistics()).resolves.toEqual({
      graduates: 4,
      employed: 2,
      seekingEmployment: 1,
      bySituation: { EMPLOYE: 2, EN_RECHERCHE_EMPLOI: 1 },
      insertionRate: 50,
    });
    expect(query.andWhere).toHaveBeenCalled();
    expect(query.getMany).toHaveBeenCalled();
    expect(studentsRepository.count).toHaveBeenCalledWith({
      where: { statutAcademique: AcademicStatus.DIPLOME },
    });
  });

  it('returns monthly series, top companies, niveau and evaluation distribution', async () => {
    const createdQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { month: '2026-01', count: '3' },
        { month: '2026-02', count: '1' },
      ]),
    };
    const completedQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([{ month: '2026-01', count: '2' }]),
    };
    const topQb = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { nom: 'Acme', ville: 'Fianarantsoa', secteur: 'IT', stages: '5' },
        { nom: 'Globex', ville: 'Antananarivo', secteur: 'Agro', stages: '3' },
      ]),
    };
    const niveauQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { niveau: 'L1', count: '10' },
        { niveau: 'L2', count: '8' },
      ]),
    };
    const evalQb = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { note: '14.00' },
        { note: '16.50' },
        { note: '6.00' },
      ]),
    };
    (internshipsRepository.createQueryBuilder as jest.Mock)
      .mockReturnValueOnce(createdQb)
      .mockReturnValueOnce(completedQb)
      .mockReturnValueOnce(topQb);
    (studentsRepository.createQueryBuilder as jest.Mock)
      .mockReturnValueOnce(niveauQb);
    (evaluationsRepository.createQueryBuilder as jest.Mock).mockReturnValueOnce(
      evalQb,
    );

    await expect(service.getOverview()).resolves.toEqual({
      byMonth: [
        { mois: '2026-01', crees: 3, termines: 2 },
        { mois: '2026-02', crees: 1, termines: 0 },
      ],
      topCompanies: [
        { nom: 'Acme', ville: 'Fianarantsoa', secteur: 'IT', stages: 5 },
        { nom: 'Globex', ville: 'Antananarivo', secteur: 'Agro', stages: 3 },
      ],
      byNiveau: [
        { niveau: 'L1', count: 10 },
        { niveau: 'L2', count: 8 },
      ],
      evalDist: [
        { note: '0-4', count: 0 },
        { note: '5-9', count: 1 },
        { note: '10-14', count: 1 },
        { note: '15-20', count: 1 },
      ],
    });
    expect(completedQb.where).toHaveBeenCalledWith(
      'internship.statut = :statut',
      { statut: InternshipStatus.TERMINE },
    );
  });
});
