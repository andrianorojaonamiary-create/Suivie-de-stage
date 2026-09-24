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
  const internshipsRepository = { find: jest.fn() };
  const usersService = { findActiveById: jest.fn() };
  const service = new CompaniesService(
    companiesRepository as never,
    studentsRepository as never,
    internshipsRepository as never,
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

  it('allows a student to create his own company profile', async () => {
    usersService.findActiveById.mockResolvedValue({
      id: 'student-id',
      role: Role.ETUDIANT,
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
        { id: 'student-id', role: Role.ETUDIANT },
      ),
    ).resolves.toMatchObject({ id: 'company-id' });
    expect(usersService.findActiveById).toHaveBeenCalledWith('student-id');
  });

  it('deactivates a company only for an administrator or its owner', async () => {
    companiesRepository.findOne.mockResolvedValue({
      id: 'company-id',
      userId: 'company-owner',
      statut: CompanyStatus.ACTIVE,
    });
    await expect(
      service.deactivate('company-id', {
        id: 'some-other-user',
        role: Role.ENCADREUR,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.deactivate('company-id', {
        id: 'company-owner',
        role: Role.ETUDIANT,
      }),
    ).resolves.toMatchObject({ statut: CompanyStatus.INACTIVE });
    await expect(
      service.deactivate('company-id', {
        id: 'admin-id',
        role: Role.ADMINISTRATEUR,
      }),
    ).resolves.toMatchObject({ statut: CompanyStatus.INACTIVE });
  });

  it('lists the distinct companies of the stages supervised by an encadreur', async () => {
    internshipsRepository.find.mockResolvedValue([
      {
        company: {
          id: 'c1',
          nom: 'Acme',
          secteurActivite: 'IT',
          adresse: 'Addr 1',
          ville: 'Fianarantsoa',
          region: 'Haute Matsiatra',
          telephone: null,
          email: 'acme@test.mg',
          siteWeb: null,
          latitude: null,
          longitude: null,
          statut: CompanyStatus.ACTIVE,
          user: { id: 'u1', nom: 'Doe', prenom: 'Jane', email: 'j@a.mg', role: Role.ENCADREUR },
        },
      },
      {
        company: Object.assign({
          id: 'c1',
          nom: 'Acme',
          secteurActivite: 'IT',
          adresse: 'Addr 1',
          ville: 'Fianarantsoa',
          region: 'Haute Matsiatra',
          telephone: null,
          email: 'acme@test.mg',
          siteWeb: null,
          latitude: null,
          longitude: null,
          statut: CompanyStatus.ACTIVE,
          user: { id: 'u1', nom: 'Doe', prenom: 'Jane', email: 'j@a.mg', role: Role.ENCADREUR },
        }),
      },
      {
        company: {
          id: 'c2',
          nom: 'Globex',
          secteurActivite: 'IT',
          adresse: 'Addr 2',
          ville: 'Antananarivo',
          region: 'Analamanga',
          telephone: null,
          email: 'globex@test.mg',
          siteWeb: null,
          latitude: null,
          longitude: null,
          statut: CompanyStatus.ACTIVE,
          user: { id: 'u2', nom: 'Roe', prenom: 'John', email: 'r@a.mg', role: Role.ENCADREUR },
        },
      },
    ]);
    const result = await service.findSupervisedCompanies({
      id: 'encadreur-id',
      role: Role.ENCADREUR,
    });
    expect(internshipsRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { supervisor: { userId: 'encadreur-id' } },
      }),
    );
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toMatchObject({ id: 'c1' });
    expect(result.data[1]).toMatchObject({ id: 'c2' });
  });

  it('returns an empty list when the encadreur supervises no stage', async () => {
    internshipsRepository.find.mockResolvedValue([]);
    await expect(
      service.findSupervisedCompanies({ id: 'encadreur-id', role: Role.ENCADREUR }),
    ).resolves.toEqual({ data: [] });
  });
});
