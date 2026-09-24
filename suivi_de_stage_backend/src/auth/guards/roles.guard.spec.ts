import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../../users/enums/role.enum';

describe('RolesGuard', () => {
  function contextWithUser(user?: { role: Role }): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  }

  it.each([Role.ETUDIANT, Role.ENCADREUR, Role.ADMINISTRATEUR])(
    'allows the %s role when required',
    (role) => {
      const reflector = {
        getAllAndOverride: jest.fn().mockReturnValue([role]),
      } as unknown as Reflector;
      const guard = new RolesGuard(reflector);

      expect(guard.canActivate(contextWithUser({ role }))).toBe(true);
    },
  );

  it('rejects an unauthenticated request for a protected role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.ADMINISTRATEUR]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(contextWithUser())).toThrow(
      ForbiddenException,
    );
  });

  it('rejects a user with an insufficient role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.ADMINISTRATEUR]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() =>
      guard.canActivate(contextWithUser({ role: Role.ETUDIANT })),
    ).toThrow(ForbiddenException);
  });

  it('allows routes without role metadata', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(contextWithUser())).toBe(true);
  });
});
