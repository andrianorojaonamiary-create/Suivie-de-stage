import { ConflictException, ForbiddenException } from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { InternshipStatus } from './enums/internship-status.enum';
import { Role } from '../users/enums/role.enum';

/**
 * Chaîne QueryBuilder minimale pour countActiveInternships : le service
 * enchaîne where/andWhere puis appelle getCount.
 */
const buildCountQuery = (count: number) => {
  const query = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(async () => count),
  };
  return query;
};

describe('InternshipsService', () => {
  const internshipsRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'stage-id', ...value })),
    findOne: jest.fn(),
    softRemove: jest.fn(),
    createQueryBuilder: jest.fn(() => buildCountQuery(0)),
  };
  const studentsRepository = { findOne: jest.fn() };
  const companiesRepository = { findOne: jest.fn() };
  const supervisorsRepository = { findOne: jest.fn() };
  const historyRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
  };
  const usersService = { findActiveById: jest.fn() };
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
    historyRepository as never,
    usersService as never,
    notificationsService as never,
  );
  const student = { id: 'student-id', user: { id: 'student-user' } };
  const company = {
    id: 'company-id',
    nom: 'Acme',
    user: { id: 'company-user' },
  };
  const supervisor = {
    id: 'supervisor-id',
    fonction: 'Directeur',
    specialite: 'Web',
    user: { id: 'supervisor-user', nom: 'Rakoto', prenom: 'Jean' },
  };
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
  const admin = { id: 'admin-id', role: Role.ADMINISTRATEUR };

  /** Simule un encadreur déjà à la limite de 10 stages actifs. */
  const internsRepositoryAtLimit = () =>
    internshipsRepository.createQueryBuilder.mockReturnValue(buildCountQuery(10));

  beforeEach(() => {
    jest.clearAllMocks();
    internshipsRepository.createQueryBuilder.mockReturnValue(
      buildCountQuery(0),
    );
    studentsRepository.findOne.mockResolvedValue(student);
    companiesRepository.findOne.mockResolvedValue(company);
    supervisorsRepository.findOne.mockResolvedValue(supervisor);
    usersService.findActiveById.mockResolvedValue({
      id: 'supervisor-user',
      role: Role.ENCADREUR,
      actif: true,
    });
  });

  it('allows an administrator to create and assign a stage', async () => {
    await expect(service.create(dto, admin)).resolves.toMatchObject({
      id: 'stage-id',
    });
    expect(notificationsService.notifyStageAssigned).toHaveBeenCalled();
  });

  it('records the initial assignment with no previous supervisor', async () => {
    await service.create(dto, admin);

    expect(historyRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        ancienSupervisorId: null,
        nouveauSupervisorId: 'supervisor-id',
        affectedByUserId: 'admin-id',
      }),
    );
  });

  it('rejects stage creation by non-administrators', async () => {
    await expect(
      service.create(dto, { id: 'student-user', role: Role.ETUDIANT }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not count a completed stage against the active-stage limit', async () => {
    internsRepositoryAtLimit();
    await expect(
      service.create(
        { ...dto, statut: InternshipStatus.TERMINE },
        admin,
      ),
    ).resolves.toMatchObject({ id: 'stage-id' });
  });

  it('counts an upcoming stage against the active-stage limit', async () => {
    internsRepositoryAtLimit();
    await expect(
      service.create({ ...dto, statut: InternshipStatus.A_VENIR }, admin),
    ).rejects.toBeInstanceOf(ConflictException);
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

    await service.update('stage-id', { statut: InternshipStatus.TERMINE }, admin);

    expect(notificationsService.notifyStageFinished).toHaveBeenCalled();
  });

  describe('changeSupervisor', () => {
    // Factory et non constante partagée : changeSupervisor mute l'entité
    // (supervisorId), donc un objet réutilisé entre deux cas de test
    // publierait le supervisorId du test précédent.
    const existingInternship = () => ({
      id: 'stage-id',
      studentId: 'student-id',
      companyId: 'company-id',
      supervisorId: 'supervisor-id',
      statut: InternshipStatus.EN_COURS,
      student,
      company,
      supervisor,
    });

    it('refuses any actor other than an administrator', async () => {
      await expect(
        service.changeSupervisor(
          'stage-id',
          { supervisorId: 'other-supervisor' },
          { id: 'x', role: Role.ENSEIGNANT },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects a supervisor already at the active-stage limit', async () => {
      internshipsRepository.findOne.mockResolvedValue(existingInternship());
      internshipsRepository.createQueryBuilder.mockReturnValue(
        buildCountQuery(10),
      );

      await expect(
        service.changeSupervisor(
          'stage-id',
          { supervisorId: 'other-supervisor' },
          admin,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(historyRepository.save).not.toHaveBeenCalled();
    });

    it('writes the history before changing the supervisor', async () => {
      internshipsRepository.findOne.mockResolvedValue(existingInternship());

      await service.changeSupervisor(
        'stage-id',
        { supervisorId: 'other-supervisor' },
        admin,
      );

      expect(historyRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ancienSupervisorId: 'supervisor-id',
          nouveauSupervisorId: 'other-supervisor',
          affectedByUserId: 'admin-id',
        }),
      );
      expect(internshipsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ supervisorId: 'other-supervisor' }),
      );
    });

    it('refuses a supervisor whose account is inactive', async () => {
      internshipsRepository.findOne.mockResolvedValue(existingInternship());
      usersService.findActiveById.mockResolvedValue(null);

      await expect(
        service.changeSupervisor(
          'stage-id',
          { supervisorId: 'other-supervisor' },
          admin,
        ),
      ).rejects.toThrow(/Encadreur introuvable ou inactif/);
    });

    it('refuses to reassign the stage to its current supervisor', async () => {
      internshipsRepository.findOne.mockResolvedValue(existingInternship());

      await expect(
        service.changeSupervisor(
          'stage-id',
          { supervisorId: 'supervisor-id' },
          admin,
        ),
      ).rejects.toThrow(/déjà affecté/);
    });
  });
});
