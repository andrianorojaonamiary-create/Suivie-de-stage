import { ForbiddenException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Role } from '../users/enums/role.enum';
import { AcademicStatus } from './enums/academic-status.enum';

describe('StudentsService', () => {
  const studentsRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'student-id', ...value })),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    softRemove: jest.fn(),
  };
  const usersService = { findActiveById: jest.fn() };
  const service = new StudentsService(
    studentsRepository as never,
    usersService as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('allows an administrator to create a student', async () => {
    usersService.findActiveById.mockResolvedValue({
      id: 'user-id',
      role: Role.ETUDIANT,
    });
    await expect(
      service.create(
        {
          userId: 'user-id',
          matricule: 'ETU-1',
          formation: 'Informatique',
          niveau: 'M2',
          promotion: '2024',
        },
        { id: 'admin-id', role: Role.ADMINISTRATEUR },
      ),
    ).resolves.toMatchObject({ id: 'student-id' });
  });

  it('rejects student creation by the student role', async () => {
    await expect(
      service.create({ userId: 'user-id' } as never, {
        id: 'student-id',
        role: Role.ETUDIANT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows an enrolled student to update only their contact fields', async () => {
    studentsRepository.findOne.mockResolvedValue({
      id: 'student-id',
      userId: 'student-user',
      telephone: null,
      adresse: null,
      statutAcademique: AcademicStatus.ACTIF,
    });
    await expect(
      service.update(
        'student-id',
        {
          telephone: '+261000000',
          adresse: 'Fianarantsoa',
          formation: 'Changed',
        },
        { id: 'student-user', role: Role.ETUDIANT },
      ),
    ).resolves.toMatchObject({
      telephone: '+261000000',
      adresse: 'Fianarantsoa',
    });
    expect(studentsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        telephone: '+261000000',
        adresse: 'Fianarantsoa',
      }),
    );
  });
});
