import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateOwnProfileDto } from './dto/update-own-profile.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
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
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // 30/min et non 10/min : le compteur sanctionne tous les essais, réussis ou
  // non, par IP et tous comptes confondus. À 10, quelques mots de passe erronés
  // sur un compte suffisaient à bloquer la connexion de tous les autres
  // pendant une minute, sans rapport avec le compte réellement visé.
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(
      verifyResetCodeDto.email,
      verifyResetCodeDto.code,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.code,
      resetPasswordDto.motDePasse,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(@Req() request: AuthenticatedRequest) {
    return this.authService.logout(request.user.id as string);
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
