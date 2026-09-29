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

  let service: StatisticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StatisticsService(
      usersRepository as never,
      studentsRepository as never,
      companiesRepository as never,
      internshipsRepository as never,
      situationsRepository as never,
    );
  });

  it('returns dashboard counters and stage status counts', async () => {
    studentsRepository.count.mockResolvedValueOnce(12);
    usersRepository.count.mockResolvedValueOnce(4);
    companiesRepository.count.mockResolvedValueOnce(8);
    internshipsRepository.count
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5);
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
    });
    expect(usersRepository.count).toHaveBeenCalledWith({
      where: { role: Role.ENCADREUR, actif: true },
    });
    expect(internshipsRepository.count).toHaveBeenCalledWith({
      where: { statut: InternshipStatus.TERMINE },
    });
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
});
