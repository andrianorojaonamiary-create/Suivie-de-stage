import { MapService } from './map.service';
import { Role } from '../users/enums/role.enum';
import { InternshipStatus } from '../internships/enums/internship-status.enum';

describe('MapService', () => {
  const internshipsRepository = { createQueryBuilder: jest.fn() };
  const companiesRepository = { createQueryBuilder: jest.fn() };
  const service = new MapService(
    internshipsRepository as never,
    companiesRepository as never,
  );

  function query(rows: unknown[]) {
    const builder = {
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(rows),
    };
    return builder;
  }

  beforeEach(() => jest.clearAllMocks());

  it('returns only public internship map fields and numeric coordinates', async () => {
    const builder = query([
      {
        id: 'stage-id',
        companyId: 'company-id',
        nomEntreprise: 'Acme',
        latitude: ' -21.45',
        longitude: '47.08',
        ville: 'Fianarantsoa',
        region: 'Haute Matsiatra',
        domaine: 'Informatique',
        statut: InternshipStatus.EN_COURS,
        intitule: 'Application web',
        description: 'Description publique',
        lieu: 'Centre-ville',
        dateDebut: '2025-01-01',
        dateFin: '2025-03-01',
        studentName: 'SHOULD_NOT_BE_RETURNED',
        email: 'secret@example.com',
      },
    ]);
    internshipsRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.findInternshipPoints(
      { limit: 10 },
      { id: 'admin-id', role: Role.ADMINISTRATEUR },
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'stage-id',
        nomEntreprise: 'Acme',
        latitude: -21.45,
        longitude: 47.08,
      }),
    ]);
    expect(result[0]).not.toHaveProperty('studentName');
    expect(result[0]).not.toHaveProperty('email');
  });

  it('applies map filters to internship points', async () => {
    const builder = query([]);
    internshipsRepository.createQueryBuilder.mockReturnValue(builder);

    await service.findInternshipPoints(
      {
        ville: 'Antananarivo',
        region: 'Analamanga',
        domaine: 'Réseaux',
        promotion: '2024',
        statut: InternshipStatus.TERMINE,
      },
      { id: 'student-id', role: Role.ETUDIANT },
    );

    expect(builder.andWhere).toHaveBeenCalledWith(
      'student.user_id = :actorId',
      { actorId: 'student-id' },
    );
    expect(builder.andWhere).toHaveBeenCalledWith(
      'internship.statut = :statut',
      { statut: InternshipStatus.TERMINE },
    );
    expect(builder.limit).toHaveBeenCalledWith(500);
  });

  it('returns public company points with stage counts', async () => {
    const builder = query([
      {
        id: 'company-id',
        nom: 'Acme',
        latitude: '-18.9',
        longitude: '47.5',
        ville: 'Antananarivo',
        region: 'Analamanga',
        secteurActivite: 'Technologies',
        statut: 'ACTIVE',
        nombreStages: '3',
        email: 'secret@example.com',
      },
    ]);
    companiesRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.findCompanyPoints(
      { limit: 20 },
      { id: 'admin-id', role: Role.ADMINISTRATEUR },
    );

    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 'company-id',
        latitude: -18.9,
        longitude: 47.5,
        nombreStages: 3,
      }),
    );
    expect(result[0]).not.toHaveProperty('email');
  });
});
