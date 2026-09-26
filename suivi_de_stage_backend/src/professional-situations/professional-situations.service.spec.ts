import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProfessionalSituationsService } from './professional-situations.service';
import { ProfessionalSituationType } from './enums/professional-situation-type.enum';
import { Role } from '../users/enums/role.enum';

describe('ProfessionalSituationsService', () => {
  const situationsRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'situation-id', ...value })),
    find: jest.fn(),
    findOne: jest.fn(),
  };
  const studentsRepository = { findOne: jest.fn() };
  const service = new ProfessionalSituationsService(
    situationsRepository as never,
    studentsRepository as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('creates a situation for the authenticated student', async () => {
    studentsRepository.findOne.mockResolvedValue({ id: 'student-id' });

    await expect(
      service.create(
        {
          situation: ProfessionalSituationType.EMPLOYE,
          entreprise: 'Acme',
          dateDebut: '2025-01-01',
        },
        { id: 'user-id', role: Role.ETUDIANT },
      ),
    ).resolves.toMatchObject({
      id: 'situation-id',
      studentId: 'student-id',
      situation: 'En emploi',
    });
    expect(situationsRepository.save).toHaveBeenCalled();
  });

  it('rejects creation by non-students', async () => {
    await expect(
      service.create(
        { situation: ProfessionalSituationType.AUTRE },
        { id: 'admin-id', role: Role.ADMINISTRATEUR },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects an invalid date range', async () => {
    studentsRepository.findOne.mockResolvedValue({ id: 'student-id' });

    await expect(
      service.create(
        {
          situation: ProfessionalSituationType.EMPLOYE,
          dateDebut: '2025-03-01',
          dateFin: '2025-02-01',
        },
        { id: 'user-id', role: Role.ETUDIANT },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('only allows the owner or administrator to update a situation', async () => {
    situationsRepository.findOne.mockResolvedValue({
      id: 'situation-id',
      studentId: 'student-id',
      situation: ProfessionalSituationType.AUTRE,
    });
    studentsRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(
        'situation-id',
        { description: 'changed' },
        { id: 'other-user', role: Role.ETUDIANT },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
