import {
  Body,
  Controller,
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
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { FindEvaluationsDto } from './dto/find-evaluations.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { EvaluationsService } from './evaluations.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('evaluations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  create(
    @Body() dto: CreateEvaluationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.evaluationsService.create(dto, request.user);
  }

  @Get('internships/:stageId')
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT, Role.ENCADREUR)
  findAll(
    @Param('stageId', new ParseUUIDPipe()) stageId: string,
    @Query() dto: FindEvaluationsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.evaluationsService.findAll(stageId, dto, request.user);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT, Role.ENCADREUR)
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.evaluationsService.findOne(id, request.user);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEvaluationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.evaluationsService.update(id, dto, request.user);
  }

  @Patch(':id/validate')
  @Roles(Role.ADMINISTRATEUR)
  validate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.evaluationsService.validate(id, request.user);
  }
}
