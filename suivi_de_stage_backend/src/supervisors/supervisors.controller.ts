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
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { FindSupervisorsDto } from './dto/find-supervisors.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { SupervisorsService } from './supervisors.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('supervisors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupervisorsController {
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Post()
  @Roles(Role.ADMINISTRATEUR)
  create(
    @Body() dto: CreateSupervisorDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.supervisorsService.create(dto, request.user);
  }

  @Get()
  @Roles(Role.ADMINISTRATEUR, Role.ENSEIGNANT, Role.ETUDIANT)
  findAll(
    @Query() dto: FindSupervisorsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.supervisorsService.findAll(dto, request.user);
  }

  @Get('me')
  @Roles(Role.ENCADREUR, Role.ADMINISTRATEUR)
  findMe(@Req() request: AuthenticatedRequest) {
    return this.supervisorsService.findMe(request.user);
  }

  @Get(':id/students')
  @Roles(Role.ENCADREUR, Role.ADMINISTRATEUR)
  findAssignedStudents(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.supervisorsService.findAssignedStudents(id, request.user);
  }

  @Get(':id')
  @Roles(Role.ENCADREUR, Role.ADMINISTRATEUR)
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.supervisorsService.findOne(id, request.user);
  }

  @Patch(':id')
  @Roles(Role.ENCADREUR, Role.ADMINISTRATEUR)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSupervisorDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.supervisorsService.update(id, dto, request.user);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.supervisorsService.remove(id, request.user);
  }
}
