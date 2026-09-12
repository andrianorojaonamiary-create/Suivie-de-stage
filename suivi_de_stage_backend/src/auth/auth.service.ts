import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { createHash } from 'crypto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const generateCode = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

const hashCode = (code: string): string =>
  createHash('sha256').update(code).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const createUserDto: CreateUserDto = {
      nom: registerDto.nom,
      prenom: registerDto.prenom,
      email: registerDto.email,
      motDePasse: registerDto.motDePasse,
      role: Role.ETUDIANT,
    };
    const user = await this.usersService.create(createUserDto);
    return this.issueToken(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );
    if (
      !user ||
      !user.actif ||
      !(await compare(loginDto.motDePasse, user.motDePasse))
    ) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    return this.issueToken(this.usersService.toPublicUserData(user));
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user || !user.actif) {
      // Réponse générique pour ne pas révéler si l'email existe en base.
      return {
        message:
          'Si un compte existe avec cet email, un email de réinitialisation a été envoyé.',
      };
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.usersService.setPasswordResetToken(
      user.id,
      hashCode(code),
      expiresAt,
    );

    try {
      await this.mailService.sendPasswordResetEmail(user.email, code);
    } catch {
      throw new ServiceUnavailableException(
        'Impossible d’envoyer l’email de réinitialisation. Vérifiez la configuration SMTP.',
      );
    }

    return {
      message:
        'Si un compte existe avec cet email, un email de réinitialisation a été envoyé.',
    };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.usersService.findByEmailWithPassword(email);

    const isValid =
      !!user &&
      user.actif &&
      user.passwordResetToken === hashCode(code) &&
      !!user.passwordResetExpiresAt &&
      user.passwordResetExpiresAt.getTime() > Date.now();

    if (!isValid) {
      throw new BadRequestException(
        'Code invalide ou expiré. Veuillez vérifier votre email ou refaire une demande.',
      );
    }

    return { valid: true };
  }

  async resetPassword(email: string, code: string, motDePasse: string) {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (
      !user ||
      user.passwordResetToken !== hashCode(code) ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        'Code invalide ou expiré. Veuillez refaire une demande.',
      );
    }

    await this.usersService.update(user.id, { motDePasse });
    await this.usersService.clearPasswordResetToken(user.id);

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  private async issueToken(user: { id: string; email: string; role: Role }) {
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
    };
  }
}
