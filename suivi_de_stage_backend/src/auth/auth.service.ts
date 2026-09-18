import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { Student } from '../students/entities/student.entity';
import { StudentLevel } from '../students/enums/student-level.enum';
import { Supervisor } from '../supervisors/entities/supervisor.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, PUBLIC_REGISTRATION_ROLES } from './dto/register.dto';

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
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Supervisor)
    private readonly supervisorsRepository: Repository<Supervisor>,
  ) {}

  async register(registerDto: RegisterDto) {
    const role = registerDto.role ?? Role.ETUDIANT;

    if (!PUBLIC_REGISTRATION_ROLES.includes(role)) {
      throw new BadRequestException(
        'Ce rôle ne peut pas être créé lors d’une inscription publique.',
      );
    }

    const createUserDto: CreateUserDto = {
      nom: registerDto.nom,
      prenom: registerDto.prenom,
      email: registerDto.email,
      motDePasse: registerDto.motDePasse,
      role,
      ...(role === Role.ENSEIGNANT
        ? {
            ...(registerDto.matricule
              ? { matricule: registerDto.matricule }
              : {}),
            ...(registerDto.grade ? { grade: registerDto.grade } : {}),
            ...(registerDto.departement
              ? { departement: registerDto.departement }
              : {}),
            ...(registerDto.specialite
              ? { specialite: registerDto.specialite }
              : {}),
            ...(registerDto.telephone
              ? { telephone: registerDto.telephone }
              : {}),
          }
        : {}),
    };
    const user = await this.usersService.create(createUserDto);

    try {
      if (role === Role.ETUDIANT) {
        await this.createStudentProfile(user.id, registerDto);
      } else if (role === Role.ENCADREUR) {
        await this.createSupervisorProfile(user.id, registerDto);
      }
    } catch (error) {
      await this.usersService.remove(user.id);
      throw error;
    }

    return this.issueToken(user);
  }

  private async createStudentProfile(
    userId: string,
    dto: RegisterDto,
  ): Promise<void> {
    const student = this.studentsRepository.create({
      userId,
      matricule: dto.matricule,
      formation: dto.formation,
      niveau: dto.niveau ?? StudentLevel.L1,
      promotion: dto.promotion ?? String(new Date().getFullYear()),
      telephone: dto.telephone ?? null,
      adresse: dto.adresse ?? null,
    });
    await this.studentsRepository.save(student);
  }

  private async createSupervisorProfile(
    userId: string,
    dto: RegisterDto,
  ): Promise<void> {
    const supervisor = this.supervisorsRepository.create({
      userId,
      fonction: dto.fonction,
      specialite: dto.specialite,
      telephone: dto.telephone ?? null,
      entreprise: dto.entreprise ?? null,
    });
    await this.supervisorsRepository.save(supervisor);
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

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findByIdWithPassword(userId);

    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    if (!(await compare(dto.ancienMotDePasse, user.motDePasse))) {
      throw new BadRequestException('Le mot de passe actuel est incorrect.');
    }

    await this.usersService.update(userId, {
      motDePasse: dto.nouveauMotDePasse,
    });

    return { message: 'Mot de passe modifié avec succès.' };
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
