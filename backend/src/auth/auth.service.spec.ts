import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '../users/enums/role.enum';
import { StudentLevel } from '../students/enums/student-level.enum';
import { StudentParcours } from '../students/enums/student-parcours.enum';

describe('AuthService', () => {
  const usersService = {
    create: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    bumpTokenVersion: jest.fn(),
    toPublicUserData: jest.fn((user) => {
      const { motDePasse, passwordResetToken, ...publicUser } = user;
      return publicUser;
    }),
  };
  const jwtService = { signAsync: jest.fn() };
  const configService = { get: jest.fn().mockReturnValue('1h') };
  const mailService = { sendPasswordResetEmail: jest.fn() };
  const studentsRepository = { create: jest.fn((v) => v), save: jest.fn() };
  const supervisorsRepository = { create: jest.fn((v) => v), save: jest.fn() };
  const service = new AuthService(
    usersService as never,
    jwtService as never,
    configService as never,
    mailService as never,
    studentsRepository as never,
    supervisorsRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService.signAsync.mockResolvedValue('signed-token');
  });

  describe('register', () => {
    const baseDto = {
      nom: 'Rakoto',
      prenom: 'Miora',
      email: 'student@example.com',
      motDePasse: 'password123',
      role: Role.ETUDIANT,
    };

    const studentDto = {
      ...baseDto,
      matricule: '100I00',
      niveau: StudentLevel.L3,
      filiere: StudentParcours.DA2I,
      promotion: '2026',
    };

    it('issues a JWT and creates the student profile row', async () => {
      const user = {
        id: 'student-id',
        email: 'student@example.com',
        nom: 'Rakoto',
        prenom: 'Miora',
        role: Role.ETUDIANT,
      };
      usersService.create.mockResolvedValue(user);

      await expect(service.register(studentDto)).resolves.toMatchObject({
        accessToken: 'signed-token',
        user,
      });
      expect(studentsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'student-id',
          matricule: '100I00',
          formation: 'DA2I',
          niveau: 'L3',
          promotion: '2026',
        }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'student-id', role: Role.ETUDIANT }),
      );
    });

    it('honours the requested role instead of forcing ETUDIANT', async () => {
      usersService.create.mockResolvedValue({
        id: 'sup-id',
        role: Role.ENCADREUR,
      });

      await service.register({
        ...baseDto,
        role: Role.ENCADREUR,
        poste: 'Directeur technique',
        specialite: 'Reseaux',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.ENCADREUR }),
      );
      expect(supervisorsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'sup-id',
          fonction: 'Directeur technique',
          specialite: 'Reseaux',
        }),
      );
      expect(studentsRepository.save).not.toHaveBeenCalled();
    });

    it('creates no profile row for a teacher, who has no table', async () => {
      usersService.create.mockResolvedValue({
        id: 'teacher-id',
        role: Role.ENSEIGNANT,
      });

      await service.register({ ...baseDto, role: Role.ENSEIGNANT });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.ENSEIGNANT }),
      );
      expect(studentsRepository.save).not.toHaveBeenCalled();
      expect(supervisorsRepository.save).not.toHaveBeenCalled();
    });

    it('rejects a student registration missing the promotion', async () => {
      usersService.create.mockResolvedValue({ id: 'student-id' });
      const { promotion, ...withoutPromotion } = studentDto;

      await expect(
        service.register(withoutPromotion as typeof studentDto),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(studentsRepository.save).not.toHaveBeenCalled();
    });

    it('rejects a supervisor registration missing the speciality', async () => {
      usersService.create.mockResolvedValue({ id: 'sup-id' });

      await expect(
        service.register({
          ...baseDto,
          role: Role.ENCADREUR,
          poste: 'Directeur technique',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(supervisorsRepository.save).not.toHaveBeenCalled();
    });
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

  it('embeds tokenVersion in the JWT so logout can invalidate it', async () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      nom: 'User',
      prenom: 'Test',
      role: Role.ADMINISTRATEUR,
      actif: true,
      tokenVersion: 3,
      motDePasse:
        '$2b$10$GgnpzcLVKHjvYbDckPcEWeBGMVsWp9YKKqp0y/tizNjseXSJmsQ.q',
    };
    usersService.findByEmailWithPassword.mockResolvedValue(user);

    await service.login({
      email: 'user@example.com',
      motDePasse: 'password',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ tokenVersion: 3 }),
    );
  });

  it('bumps tokenVersion on logout', async () => {
    await service.logout('user-id');

    expect(usersService.bumpTokenVersion).toHaveBeenCalledWith('user-id');
  });
});
