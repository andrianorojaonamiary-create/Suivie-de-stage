import { ForbiddenException } from '@nestjs/common';
import { InternshipTrackingService } from './internship-tracking.service';
import { Role } from '../users/enums/role.enum';
import { FollowUpType } from './enums/follow-up-type.enum';

describe('InternshipTrackingService', () => {
  const followUpsRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'follow-up-id', ...value })),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const internshipsRepository = { findOne: jest.fn() };
  const service = new InternshipTrackingService(
    followUpsRepository as never,
    internshipsRepository as never,
  );
  const stage = {
    id: 'stage-id',
    intitule: 'Projet web',
    student: { user: { id: 'student-id' } },
    company: { user: { id: 'company-id' } },
    supervisor: { user: { id: 'supervisor-id' } },
  };

  beforeEach(() => jest.clearAllMocks());

  it('allows the assigned supervisor to create an observation', async () => {
    internshipsRepository.findOne.mockResolvedValue(stage);

    await expect(
      service.create(
        'stage-id',
        { contenu: 'Visite effectuée', type: FollowUpType.VISITE },
        { id: 'supervisor-id', role: Role.ENCADREUR },
      ),
    ).resolves.toMatchObject({ internshipId: 'stage-id' });
    expect(followUpsRepository.save).toHaveBeenCalled();
  });

  it.each([
    [Role.ETUDIANT, 'student-id'],
    [Role.ENSEIGNANT, 'enseignant-id'],
  ])('rejects observation creation by %s', async (role, id) => {
    internshipsRepository.findOne.mockResolvedValue(stage);

    await expect(
      service.create(
        'stage-id',
        { contenu: 'Tentative', type: FollowUpType.AUTRE },
        { id, role },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the student to consult but not write observations', async () => {
    internshipsRepository.findOne.mockResolvedValue(stage);
    const query = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    followUpsRepository.createQueryBuilder.mockReturnValue(query);

    await expect(
      service.findAll(
        'stage-id',
        {},
        { id: 'student-id', role: Role.ETUDIANT },
      ),
    ).resolves.toMatchObject({ meta: { total: 0 } });
    await expect(
      service.create(
        'stage-id',
        { contenu: 'Nope', type: FollowUpType.AUTRE },
        { id: 'student-id', role: Role.ETUDIANT },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
