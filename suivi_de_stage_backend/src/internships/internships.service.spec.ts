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
  const usersRepository = { findOne: jest.fn() };
  const notificationsService = {
    notifyStageAssigned: jest.fn(),
    notifyStageModified: jest.fn(),
    notifyStageFinished: jest.fn(),
    notifyStageAwaitingValidation: jest.fn(),
    notifyStageAwaitingProfessionalSupervisor: jest.fn(),
    notifyStageStatusChanged: jest.fn(),
  };
  const service = new InternshipsService(
    internshipsRepository as never,
    studentsRepository as never,
    companiesRepository as never,
    supervisorsRepository as never,
    usersRepository as never,
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

  it('rejects stage creation by non-administrators and non-students', async () => {
    await expect(
      service.create(dto, { id: 'encadreur-user', role: Role.ENCADREUR }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.create(dto, { id: 'enseignant-user', role: Role.ENSEIGNANT }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a student to create a pending stage for his own profile', async () => {
    studentsRepository.findOne.mockResolvedValue({ id: 'own-student-id' });
    companiesRepository.findOne.mockResolvedValue(company);
    supervisorsRepository.findOne.mockResolvedValue(supervisor);

    await expect(
      service.create(dto, { id: 'student-user', role: Role.ETUDIANT }),
    ).resolves.toMatchObject({
      id: 'stage-id',
      statut: InternshipStatus.EN_ATTENTE,
    });
    expect(studentsRepository.findOne).toHaveBeenCalledWith({
      where: { userId: 'student-user' },
    });
    expect(
      notificationsService.notifyStageAwaitingValidation,
    ).toHaveBeenCalled();
    expect(
      notificationsService.notifyStageAwaitingProfessionalSupervisor,
    ).not.toHaveBeenCalled();
  });

  it('alerts the administrator when a student submits a stage without a professional supervisor account', async () => {
    studentsRepository.findOne.mockResolvedValue({ id: 'own-student-id' });
    companiesRepository.findOne.mockResolvedValue(company);

    await expect(
      service.create(
        {
          ...dto,
          supervisorId: undefined,
          encadreurProfessionnelNom: 'M. Rabe',
        },
        { id: 'student-user', role: Role.ETUDIANT },
      ),
    ).resolves.toMatchObject({
      id: 'stage-id',
      statut: InternshipStatus.EN_ATTENTE,
    });
    expect(
      notificationsService.notifyStageAwaitingProfessionalSupervisor,
    ).toHaveBeenCalled();
  });

  it('allows a student to delete his own pending stage only', async () => {
    internshipsRepository.findOne.mockResolvedValue({
      id: 'stage-id',
      statut: InternshipStatus.EN_ATTENTE,
      student: { user: { id: 'student-user' } },
      company: { user: { id: 'company-user' } },
      supervisor: { user: { id: 'supervisor-user' } },
    });

    await expect(
      service.remove('stage-id', { id: 'student-user', role: Role.ETUDIANT }),
    ).resolves.toEqual(
      expect.objectContaining({ message: expect.any(String) }),
    );
    expect(internshipsRepository.softRemove).toHaveBeenCalled();

    internshipsRepository.findOne.mockResolvedValue({
      id: 'stage-id',
      statut: InternshipStatus.EN_COURS,
      student: { user: { id: 'student-user' } },
      company: { user: { id: 'company-user' } },
      supervisor: { user: { id: 'supervisor-user' } },
    });
    await expect(
      service.remove('stage-id', { id: 'student-user', role: Role.ETUDIANT }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a supervisor to validate or refuse a pending stage', async () => {
    internshipsRepository.findOne.mockResolvedValue({
      id: 'stage-id',
      studentId: 'student-id',
      companyId: 'company-id',
      supervisorId: 'supervisor-id',
      statut: InternshipStatus.EN_ATTENTE,
      student,
      company,
      supervisor,
    });

    await service.update(
      'stage-id',
      { statut: InternshipStatus.EN_COURS },
      { id: 'supervisor-user', role: Role.ENCADREUR },
    );

    expect(notificationsService.notifyStageStatusChanged).toHaveBeenCalled();
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

  it('allows a tuteur (enseignant) to validate or refuse a pending stage he tutors', async () => {
    internshipsRepository.findOne.mockResolvedValue({
      id: 'stage-id',
      studentId: 'student-id',
      companyId: 'company-id',
      supervisorId: 'supervisor-id',
      tuteurId: 'tuteur-user',
      statut: InternshipStatus.EN_ATTENTE,
      student,
      company,
      supervisor,
    });

    await service.update(
      'stage-id',
      { statut: InternshipStatus.EN_COURS, observations: 'Conforme' },
      { id: 'tuteur-user', role: Role.ENSEIGNANT },
    );

    expect(notificationsService.notifyStageStatusChanged).toHaveBeenCalled();
  });

  it('prevents an enseignant who is not the tuteur from validating a stage', async () => {
    internshipsRepository.findOne.mockResolvedValue({
      id: 'stage-id',
      tuteurId: 'other-tuteur-user',
      statut: InternshipStatus.EN_ATTENTE,
      student,
      company,
      supervisor,
    });

    await expect(
      service.update(
        'stage-id',
        { statut: InternshipStatus.EN_COURS },
        { id: 'tuteur-user', role: Role.ENSEIGNANT },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
