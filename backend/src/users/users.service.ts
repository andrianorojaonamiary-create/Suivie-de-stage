import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateOwnProfileDto } from '../auth/dto/update-own-profile.dto';
import { saveCatchingConflict } from '../common/database/save-with-conflict';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.toLowerCase();
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur existe déjà avec cet email.');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      email,
      motDePasse: await hash(createUserDto.motDePasse, 12),
    });

    return this.saveAndSanitize(user);
  }

  async findAll(findUsersDto: FindUsersDto) {
    const page = findUsersDto.page ?? 1;
    const limit = findUsersDto.limit ?? 10;
    const query = this.usersRepository.createQueryBuilder('user');

    if (findUsersDto.role) {
      query.andWhere('user.role = :role', { role: findUsersDto.role });
    }
    if (findUsersDto.search) {
      query.andWhere(
        '(LOWER(user.nom) LIKE LOWER(:search) OR LOWER(user.prenom) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${findUsersDto.search}%` },
      );
    }

    const [users, total] = await query
      .orderBy('user.dateCreation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: users.map((user) => this.toPublicUser(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.toPublicUser(await this.findEntity(id));
  }

  async findByEmailWithPassword(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.motDePasse')
      .addSelect('user.passwordResetToken')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  async findActiveById(id: string) {
    return this.usersRepository.findOne({
      where: { id, actif: true },
    });
  }

  /**
   * Invalide tous les JWT déjà émis pour cet utilisateur. Utilisé au logout et
   * à chaque changement de mot de passe.
   */
  async bumpTokenVersion(id: string) {
    await this.usersRepository.increment({ id }, 'tokenVersion', 1);
  }

  async setPasswordResetToken(id: string, tokenHash: string, expiresAt: Date) {
    await this.usersRepository.update(id, {
      passwordResetToken: tokenHash,
      passwordResetExpiresAt: expiresAt,
    });
  }

  async clearPasswordResetToken(id: string) {
    await this.usersRepository.update(id, {
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const changes: DeepPartial<User> = { ...updateUserDto };

    if (updateUserDto.email) {
      changes.email = updateUserDto.email.toLowerCase();
      const existingUser = await this.usersRepository.findOne({
        where: { email: changes.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          'Un utilisateur existe déjà avec cet email.',
        );
      }
    }

    if (updateUserDto.motDePasse) {
      changes.motDePasse = await hash(updateUserDto.motDePasse, 12);
    }

    const user = await this.usersRepository.preload({ id, ...changes });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const saved = await this.saveAndSanitize(user);

    if (updateUserDto.motDePasse) {
      await this.bumpTokenVersion(id);
    }

    return saved;
  }

  async updateOwnProfile(id: string, dto: UpdateOwnProfileDto) {
    return this.update(id, dto);
  }

  async updateStatus(id: string, updateUserStatusDto: UpdateUserStatusDto) {
    const user = await this.findEntity(id);
    user.actif = updateUserStatusDto.actif;
    return this.saveAndSanitize(user);
  }

  async remove(id: string) {
    const user = await this.findEntity(id);
    await this.usersRepository.remove(user);
    return { message: 'Utilisateur supprimé avec succès.' };
  }

  private async findEntity(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return user;
  }

  private async saveAndSanitize(user: User) {
    return saveCatchingConflict(
      async () => this.toPublicUser(await this.usersRepository.save(user)),
      'Un utilisateur existe déjà avec cet email.',
    );
  }

  private toPublicUser(
    user: User,
  ): Omit<User, 'motDePasse' | 'passwordResetToken'> {
    const { motDePasse, passwordResetToken, ...publicUser } = user;
    return publicUser;
  }

  toPublicUserData(
    user: User,
  ): Omit<User, 'motDePasse' | 'passwordResetToken'> {
    return this.toPublicUser(user);
  }
}
