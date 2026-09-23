import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './enums/notification-type.enum';
import { Role } from '../users/enums/role.enum';

describe('NotificationsService', () => {
  const repository = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ id: 'notification-id', ...value })),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const usersRepository = { find: jest.fn() };
  const mailService = { sendNewUserNotificationEmail: jest.fn() };
  const service = new NotificationsService(
    repository as never,
    usersRepository as never,
    mailService as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('creates one notification per unique stage participant', async () => {
    const stage = {
      id: 'stage-id',
      intitule: 'Projet web',
      student: { user: { id: 'student-id' } },
      company: { user: { id: 'company-id' } },
      supervisor: { user: { id: 'supervisor-id' } },
    } as never;

    await service.notifyStageAssigned(stage);

    expect(repository.save).toHaveBeenCalledTimes(3);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: NotificationType.STAGE_AFFECTE,
        referenceId: 'stage-id',
      }),
    );
  });

  it('notifies every active administrator when a professional supervisor is missing', async () => {
    const stage = {
      id: 'stage-id',
      intitule: 'Projet web',
      student: { user: { id: 'student-id' } },
      supervisor: null,
    } as never;
    usersRepository.find.mockResolvedValue([
      { id: 'admin-1' },
      { id: 'admin-2' },
    ]);

    await service.notifyStageAwaitingProfessionalSupervisor(stage);

    expect(usersRepository.find).toHaveBeenCalledWith({
      where: { role: Role.ADMINISTRATEUR, actif: true },
    });
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it('marks only an owned notification as read', async () => {
    const notification = { id: 'notification-id', lu: false };
    repository.findOne.mockResolvedValue(notification);

    await expect(
      service.markAsRead('notification-id', {
        id: 'student-id',
        role: Role.ETUDIANT,
      }),
    ).resolves.toMatchObject({ lu: true });
    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        id: 'notification-id',
        utilisateurDestinataireId: 'student-id',
      },
    });
  });

  it('rejects reading another user notification', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.markAsRead('notification-id', {
        id: 'other-user',
        role: Role.ETUDIANT,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
