import { ForbiddenException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyStatus } from './enums/company-status.enum';
import { Role } from '../users/enums/role.enum';

describe('CompaniesService', () => {
  const companiesRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'company-id', ...value })),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const studentsRepository = { find: jest.fn() };
  const usersService = { findActiveById: jest.fn() };
  const service = new CompaniesService(
    companiesRepository as never,
    studentsRepository as never,
    usersService as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('allows an administrator to create a company profile', async () => {
    usersService.findActiveById.mockResolvedValue({
      id: 'user-id',
      role: Role.ENCADREUR,
    });
    await expect(
      service.create(
        {
          userId: 'user-id',
          nom: 'Acme',
          secteurActivite: 'IT',
          adresse: 'Address',
          ville: 'Fianarantsoa',
          region: 'Haute Matsiatra',
          email: 'contact@acme.test',
        },
        { id: 'admin-id', role: Role.ADMINISTRATEUR },
      ),
    ).resolves.toMatchObject({ id: 'company-id' });
  });

  it('allows an encadreur to create his own company profile', async () => {
    usersService.findActiveById.mockResolvedValue({
      id: 'encadreur-id',
      role: Role.ENCADREUR,
    });
    await expect(
      service.create(
        {
          nom: 'Acme',
          secteurActivite: 'IT',
          adresse: 'Address',
          ville: 'Fianarantsoa',
          email: 'contact@acme.test',
        },
        { id: 'encadreur-id', role: Role.ENCADREUR },
      ),
    ).resolves.toMatchObject({ id: 'company-id' });
    expect(usersService.findActiveById).toHaveBeenCalledWith('encadreur-id');
  });

  it('rejects company creation by a student', async () => {
    await expect(
      service.create({ userId: 'user-id' } as never, {
        id: 'student-id',
        role: Role.ETUDIANT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deactivates a company only for an administrator', async () => {
    await expect(
      service.deactivate('company-id', {
        id: 'company-user',
        role: Role.ENCADREUR,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    companiesRepository.findOne.mockResolvedValue({
      id: 'company-id',
      statut: CompanyStatus.ACTIVE,
    });
    await expect(
      service.deactivate('company-id', {
        id: 'admin-id',
        role: Role.ADMINISTRATEUR,
      }),
    ).resolves.toMatchObject({ statut: CompanyStatus.INACTIVE });
  });
});
