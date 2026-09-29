import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { createHash, randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { saveCatchingConflict } from '../common/database/save-with-conflict';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { Student } from '../students/entities/student.entity';
import { Supervisor } from '../supervisors/entities/supervisor.entity';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

/**
 * Libellés des champs de profil dans les messages d'erreur. Les clés sont les
 * noms de propriété du DTO, ce qui évite d'écrire deux fois la même liste.
 */
const LABELS_STUDENT = {
  matricule: 'le numéro étudiant',
  niveau: 'le niveau',
  filiere: 'la filière',
  promotion: 'la promotion',
} as const;

const LABELS_SUPERVISOR = {
  poste: 'la fonction',
  specialite: 'la spécialité',
} as const;

/**
 * Message volontairement identique pour toute demande de réinitialisation,
 * que l'email existe ou non : il ne doit rien révéler sur les comptes.
 */
const NEUTRAL_RESET_MESSAGE =
  'Si un compte existe avec cet email, un email de réinitialisation a été envoyé.';

/**
 * CSPRNG, pas Math.random() : ce code est un identifiant d'authentification
 * à 6 chiffres, donc l'espace est réduit (~1M) et un générateur prévisible
 * serait devinable en quelques milliers d'essais.
 */
const generateCode = (): string =>
  String(randomInt(0, 1_000_000)).padStart(6, '0');

const hashCode = (code: string): string =>
  createHash('sha256').update(code).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    // Les repositories sont injectés directement plutôt que StudentsService et
    // SupervisorsService : ces modules importent AuthModule pour leurs gardes,
    // donc AuthModule ne peut pas les importer sans créer un cycle. C'est le
    // même choix que InternshipsService pour Student et Supervisor.
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Supervisor)
    private readonly supervisorsRepository: Repository<Supervisor>,
  ) {}

  /**
   * Inscription publique.
   *
   * Crée le compte puis la ligne de profil correspondant au rôle. Sans cette
   * seconde étape, un compte fraîchement inscrit n'existe que dans `users` :
   * il est invisible de /students, des pages étudiant, et l'étudiant n'a
   * aucune fiche à laquelle rattacher un stage.
   *
   * ENSEIGNANT est le seul rôle sans ligne de profil : il n'existe pas de
   * table pour un enseignant, le compte est donc créé seul (grade, département
   * et spécialité n'ont nulle part où être stockés).
   */
  async register(registerDto: RegisterDto) {
    const role = registerDto.role;
    const createUserDto: CreateUserDto = {
      nom: registerDto.nom,
      prenom: registerDto.prenom,
      email: registerDto.email,
      motDePasse: registerDto.motDePasse,
      role,
    };
    const user = await this.usersService.create(createUserDto);

    if (role === Role.ETUDIANT) {
      await this.createStudentProfile(user, registerDto);
    } else if (role === Role.ENCADREUR) {
      await this.createSupervisorProfile(user, registerDto);
    }

    return this.issueToken(user);
  }

  private async createStudentProfile(
    user: { id: string },
    dto: RegisterDto,
  ) {
    const missing = (['matricule', 'niveau', 'filiere', 'promotion'] as const)
      .filter((field) => !dto[field])
      .map((field) => LABELS_STUDENT[field]);
    if (missing.length > 0) {
      throw new BadRequestException(
        `Inscription étudiant incomplète : ${missing.join(', ')}.`,
      );
    }

    const student = this.studentsRepository.create({
      userId: user.id,
      matricule: dto.matricule,
      formation: dto.filiere,
      niveau: dto.niveau,
      promotion: dto.promotion,
      telephone: dto.telephone ?? null,
      adresse: dto.adresse ?? null,
    });

    await saveCatchingConflict(
      async () => {
        await this.studentsRepository.save(student);
      },
      'Ce matricule est déjà utilisé par un autre étudiant.',
    );
  }

  private async createSupervisorProfile(
    user: { id: string },
    dto: RegisterDto,
  ) {
    const missing = (['poste', 'specialite'] as const)
      .filter((field) => !dto[field])
      .map((field) => LABELS_SUPERVISOR[field]);
    if (missing.length > 0) {
      throw new BadRequestException(
        `Inscription encadreur incomplète : ${missing.join(', ')}.`,
      );
    }

    const supervisor = this.supervisorsRepository.create({
      userId: user.id,
      fonction: dto.poste,
      specialite: dto.specialite,
      telephone: dto.telephone ?? null,
    });

    await saveCatchingConflict(
      async () => {
        await this.supervisorsRepository.save(supervisor);
      },
      'Ce compte possède déjà un profil encadreur.',
    );
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
      return { message: NEUTRAL_RESET_MESSAGE };
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

    return { message: NEUTRAL_RESET_MESSAGE };
  }

  async verifyResetCode(email: string, code: string) {
    return { valid: await this.isResetCodeValid(email, code) };
  }

  async resetPassword(email: string, code: string, motDePasse: string) {
    if (!(await this.isResetCodeValid(email, code))) {
      throw new BadRequestException('Code invalide ou expiré.');
    }

    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      throw new BadRequestException('Code invalide ou expiré.');
    }

    await this.usersService.update(user.id, { motDePasse });
    await this.usersService.clearPasswordResetToken(user.id);

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  /**
   * Invalide tous les JWT existants de l'utilisateur. Appelé par /auth/logout :
   * sans ça, le token reste accepté jusqu'à l'expiration.
   */
  async logout(userId: string) {
    await this.usersService.bumpTokenVersion(userId);
    return { message: 'Déconnexion effectuée.' };
  }

  /**
   * Message d'erreur unique quel que soit le motif de l'échec (email inconnu,
   * compte inactif, code faux, code expiré) : sinon la réponse permet de
   * tester quels emails existent et quels codes sont actifs.
   */
  private async isResetCodeValid(
    email: string,
    code: string,
  ): Promise<boolean> {
    const user = await this.usersService.findByEmailWithPassword(email);

    return (
      !!user &&
      user.actif &&
      user.passwordResetToken === hashCode(code) &&
      !!user.passwordResetExpiresAt &&
      user.passwordResetExpiresAt.getTime() > Date.now()
    );
  }

  private async issueToken(user: {
    id: string;
    email: string;
    role: Role;
    tokenVersion: number;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
    };
  }
}
