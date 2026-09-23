import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../users/enums/role.enum';

describe('AuthService', () => {
  const usersService = {
    create: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    toPublicUserData: jest.fn((user) => {
      const { motDePasse, ...publicUser } = user;
      return publicUser;
    }),
  };
  const jwtService = { signAsync: jest.fn() };
  const configService = { get: jest.fn().mockReturnValue('1h') };
  const mailService = { sendPasswordResetEmail: jest.fn() };
  const notificationsService = { notifyNewUserRegistration: jest.fn() };
  const studentsRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const supervisorsRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(),
  };
  const service = new AuthService(
    usersService as never,
    jwtService as never,
    configService as never,
    mailService as never,
    notificationsService as never,
    studentsRepository as never,
    supervisorsRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService.signAsync.mockResolvedValue('signed-token');
  });

  it('registers a student and issues a JWT without adding an alumni role', async () => {
    const user = {
      id: 'student-id',
      email: 'student@example.com',
      nom: 'Rakoto',
      prenom: 'Miora',
      role: Role.ETUDIANT,
    };
    usersService.create.mockResolvedValue(user);

    await expect(
      service.register({
        nom: 'Rakoto',
        prenom: 'Miora',
        email: 'student@example.com',
        motDePasse: 'password123',
      }),
    ).resolves.toMatchObject({ accessToken: 'signed-token', user });
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: Role.ETUDIANT }),
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'student-id', role: Role.ETUDIANT }),
    );
  });

  it('logs in an active user with the correct password', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      nom: 'User',
      prenom: 'Test',
      role: Role.ADMINISTRATEUR,
      actif: true,
      motDePasse:
        '$2b$10$GgnpzcLVKHjvYbDckPcEWeBGMVsWp9YKKqp0y/tizNjseXSJmsQ.q',
    });

    const result = await service.login({
      email: 'user@example.com',
      motDePasse: 'password',
    });

    expect(result.accessToken).toBe('signed-token');
    expect(jwtService.signAsync).toHaveBeenCalled();
  });

  it.each([
    ['unknown user', null],
    ['inactive user', { actif: false, motDePasse: 'password' }],
    ['wrong password', { actif: true, motDePasse: 'not-the-password' }],
  ])('rejects login for %s', async (_case, user) => {
    usersService.findByEmailWithPassword.mockResolvedValue(user);

    await expect(
      service.login({ email: 'user@example.com', motDePasse: 'password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
