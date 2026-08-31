import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
import { UsersService } from '../users/users.service';

interface AuthenticatedRequest extends Request {
  user: Record<string, unknown>;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @Body() dto: UpdateOwnProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.updateOwnProfile(request.user.id as string, dto);
  }
}
