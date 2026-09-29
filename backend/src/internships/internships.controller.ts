import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { ChangeSupervisorDto } from './dto/change-supervisor.dto';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { FindAvailableSupervisorsDto } from './dto/find-available-supervisors.dto';
import { FindInternshipsDto } from './dto/find-internships.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { InternshipsService } from './internships.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('internships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Post()
  @Roles(Role.ADMINISTRATEUR)
  create(
    @Body() dto: CreateInternshipDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.create(dto, request.user);
  }

  @Get()
  findAll(
    @Query() dto: FindInternshipsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.findAll(dto, request.user);
  }

  // Doit être déclaré AVANT @Get(':id') : sinon Nest matche la chaîne
  // « encadreurs-disponibles » comme un identifiant et répond 400.
  @Get('encadreurs-disponibles')
  @Roles(Role.ADMINISTRATEUR)
  findAvailableSupervisors(
    @Query() dto: FindAvailableSupervisorsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.findAvailableSupervisors(dto, request.user);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.findOne(id, request.user);
  }

  // L'enseignant consulte l'historique mais n'affecte pas : l'affectation est
  // réservée à l'administrateur.
  @Get(':id/historique-encadreurs')
  @Roles(Role.ADMINISTRATEUR, Role.ENSEIGNANT)
  getSupervisorHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.getSupervisorHistory(id, request.user);
  }

  @Patch(':id/supervisor')
  @Roles(Role.ADMINISTRATEUR)
  changeSupervisor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ChangeSupervisorDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.changeSupervisor(id, dto, request.user);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR, Role.ENTREPRISE)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInternshipDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.update(id, dto, request.user);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.remove(id, request.user);
  }
}
