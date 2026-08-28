import { ForbiddenException } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { Role } from '../users/enums/role.enum';

describe('SupervisorsService', () => {
  const supervisorsRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'supervisor-id', ...value })),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const studentsRepository = { find: jest.fn() };
  const usersService = { findActiveById: jest.fn() };
  const service = new SupervisorsService(
    supervisorsRepository as never,
    studentsRepository as never,
    usersService as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('allows an administrator to create an assigned supervisor profile', async () => {
    usersService.findActiveById.mockResolvedValue({
      id: 'user-id',
      role: Role.ENCADREUR,
    });
    await expect(
      service.create(
        { userId: 'user-id', fonction: 'Enseignant', specialite: 'Réseaux' },
        { id: 'admin-id', role: Role.ADMINISTRATEUR },
      ),
    ).resolves.toMatchObject({ id: 'supervisor-id' });
  });

  it('rejects supervisor CRUD creation by a company', async () => {
    await expect(
      service.create({ userId: 'user-id' } as never, {
        id: 'company-id',
        role: Role.ENTREPRISE,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows only the assigned supervisor or administrator to read a profile', async () => {
    supervisorsRepository.findOne.mockResolvedValue({
      id: 'supervisor-id',
      userId: 'assigned-user',
      fonction: 'Enseignant',
      specialite: 'Réseaux',
    });
    await expect(
      service.findOne('supervisor-id', {
        id: 'other-user',
        role: Role.ENCADREUR,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.findOne('supervisor-id', {
        id: 'assigned-user',
        role: Role.ENCADREUR,
      }),
    ).resolves.toMatchObject({ id: 'supervisor-id' });
  });
});
