import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
