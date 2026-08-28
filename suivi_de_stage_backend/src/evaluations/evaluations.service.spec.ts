import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluatorType } from './enums/evaluator-type.enum';
import { Role } from '../users/enums/role.enum';

describe('EvaluationsService', () => {
  const evaluationsRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'evaluation-id', ...value })),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const internshipsRepository = { findOne: jest.fn() };
  const usersService = { findActiveById: jest.fn() };
  const notificationsService = { notifyEvaluation: jest.fn() };
  const service = new EvaluationsService(
    evaluationsRepository as never,
    internshipsRepository as never,
    usersService as never,
    notificationsService as never,
  );
  const stage = {
    id: 'stage-id',
    student: { user: { id: 'student-id' } },
    company: { user: { id: 'company-id' } },
    supervisor: { user: { id: 'supervisor-id' } },
  };

  beforeEach(() => jest.clearAllMocks());

  it.each([
    [EvaluatorType.ENCADREUR, Role.ENCADREUR, 'supervisor-id'],
    [EvaluatorType.ENTREPRISE, Role.ENTREPRISE, 'company-id'],
  ])(
    'allows the assigned %s to create an evaluation',
    async (type, role, id) => {
      internshipsRepository.findOne.mockResolvedValue(stage);
      usersService.findActiveById.mockResolvedValue({
        id,
        nom: 'Test',
        prenom: 'User',
        role,
      });

      await expect(
        service.create(
          {
            stageId: 'stage-id',
            evaluateurId: id,
            typeEvaluateur: type,
            note: 4,
          },
          { id, role },
        ),
      ).resolves.toMatchObject({ id: 'evaluation-id' });
      expect(notificationsService.notifyEvaluation).toHaveBeenCalledWith(stage);
    },
  );

  it('rejects an evaluator who is not assigned to the stage', async () => {
    internshipsRepository.findOne.mockResolvedValue(stage);
    usersService.findActiveById.mockResolvedValue({
      id: 'other-supervisor',
      role: Role.ENCADREUR,
    });

    await expect(
      service.create(
        {
          stageId: 'stage-id',
          evaluateurId: 'other-supervisor',
          typeEvaluateur: EvaluatorType.ENCADREUR,
          note: 3,
        },
        { id: 'other-supervisor', role: Role.ENCADREUR },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows only an administrator to validate an evaluation', async () => {
    await expect(
      service.validate('evaluation-id', {
        id: 'student-id',
        role: Role.ETUDIANT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    evaluationsRepository.findOne.mockResolvedValue({
      id: 'evaluation-id',
      validee: false,
    });
    await expect(
      service.validate('evaluation-id', {
        id: 'admin-id',
        role: Role.ADMINISTRATEUR,
      }),
    ).resolves.toMatchObject({ validee: true });
  });
});
