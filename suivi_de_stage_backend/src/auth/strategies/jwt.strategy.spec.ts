import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { Role } from '../../users/enums/role.enum';

describe('JwtStrategy', () => {
  const usersService = {
    findActiveById: jest.fn(),
    toPublicUserData: jest.fn((user) => user),
  };
  const configService = {
    get: jest.fn().mockReturnValue('a-secret-with-at-least-32-characters'),
  } as unknown as ConfigService;
  const strategy = new JwtStrategy(configService, usersService as never);

  beforeEach(() => jest.clearAllMocks());

  it('validates an active user and returns public data', async () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      role: Role.ETUDIANT,
      actif: true,
    };
    usersService.findActiveById.mockResolvedValue(user);

    await expect(
      strategy.validate({ sub: 'user-id', email: user.email, role: user.role }),
    ).resolves.toEqual(user);
    expect(usersService.findActiveById).toHaveBeenCalledWith('user-id');
  });

  it('rejects a missing or inactive user from a JWT', async () => {
    usersService.findActiveById.mockResolvedValue(null);

    await expect(
      strategy.validate({
        sub: 'deleted-user',
        email: 'deleted@example.com',
        role: Role.ETUDIANT,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
