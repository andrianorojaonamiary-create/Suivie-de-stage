import { ForbiddenException } from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { InternshipStatus } from './enums/internship-status.enum';
import { Role } from '../users/enums/role.enum';

describe('InternshipsService', () => {
  const internshipsRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'stage-id', ...value })),
    findOne: jest.fn(),
    softRemove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const studentsRepository = { findOne: jest.fn() };
  const companiesRepository = { findOne: jest.fn() };
  const supervisorsRepository = { findOne: jest.fn() };
  const notificationsService = {
    notifyStageAssigned: jest.fn(),
    notifyStageModified: jest.fn(),
    notifyStageFinished: jest.fn(),
  };
  const service = new InternshipsService(
    internshipsRepository as never,
    studentsRepository as never,
    companiesRepository as never,
    supervisorsRepository as never,
    notificationsService as never,
  );
  const student = { id: 'student-id', user: { id: 'student-user' } };
  const company = {
    id: 'company-id',
    nom: 'Acme',
    user: { id: 'company-user' },
  };
  const supervisor = { id: 'supervisor-id', user: { id: 'supervisor-user' } };
  const dto = {
    studentId: 'student-id',
    companyId: 'company-id',
    supervisorId: 'supervisor-id',
    intitule: 'Projet web',
    description: 'Description',
    domaine: 'Informatique',
    lieu: 'Antananarivo',
    ville: 'Antananarivo',
    dateDebut: '2025-01-01',
    dateFin: '2025-03-01',
    statut: InternshipStatus.A_VENIR,
  };

  beforeEach(() => jest.clearAllMocks());

  it('allows an administrator to create and assign a stage', async () => {
    studentsRepository.findOne.mockResolvedValue(student);
    companiesRepository.findOne.mockResolvedValue(company);
    supervisorsRepository.findOne.mockResolvedValue(supervisor);

    await expect(
      service.create(dto, { id: 'admin-id', role: Role.ADMINISTRATEUR }),
    ).resolves.toMatchObject({ id: 'stage-id' });
    expect(notificationsService.notifyStageAssigned).toHaveBeenCalled();
  });

  it('rejects stage creation by non-administrators', async () => {
    await expect(
      service.create(dto, { id: 'student-user', role: Role.ETUDIANT }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('notifies status changes to completed', async () => {
    internshipsRepository.findOne.mockResolvedValue({
      id: 'stage-id',
      studentId: 'student-id',
      companyId: 'company-id',
      supervisorId: 'supervisor-id',
      statut: InternshipStatus.EN_COURS,
      student,
      company,
      supervisor,
    });

    await service.update(
      'stage-id',
      { statut: InternshipStatus.TERMINE },
      { id: 'admin-id', role: Role.ADMINISTRATEUR },
    );

    expect(notificationsService.notifyStageFinished).toHaveBeenCalled();
  });
});
