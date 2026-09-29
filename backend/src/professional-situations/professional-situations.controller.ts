import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { CreateProfessionalSituationDto } from './dto/create-professional-situation.dto';
import { UpdateProfessionalSituationDto } from './dto/update-professional-situation.dto';
import { ProfessionalSituationsService } from './professional-situations.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('professional-situations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfessionalSituationsController {
  constructor(
    private readonly situationsService: ProfessionalSituationsService,
  ) {}

  @Post()
  @Roles(Role.ETUDIANT)
  create(
    @Body() dto: CreateProfessionalSituationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.situationsService.create(dto, request.user);
  }

  @Get('me')
  @Roles(Role.ETUDIANT)
  findMine(@Req() request: AuthenticatedRequest) {
    return this.situationsService.findMine(request.user);
  }

  @Get('student/:studentId')
  @Roles(Role.ADMINISTRATEUR)
  findStudentHistory(
    @Param('studentId', new ParseUUIDPipe()) studentId: string,
  ) {
    return this.situationsService.findStudentHistory(studentId);
  }

  @Get()
  @Roles(Role.ADMINISTRATEUR)
  findAll() {
    return this.situationsService.findAll();
  }

  @Patch(':id')
  @Roles(Role.ETUDIANT, Role.ADMINISTRATEUR)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProfessionalSituationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.situationsService.update(id, dto, request.user);
  }
}
