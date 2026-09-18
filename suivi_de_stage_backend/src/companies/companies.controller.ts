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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { FindCompaniesDto } from './dto/find-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  create(@Body() dto: CreateCompanyDto, @Req() request: AuthenticatedRequest) {
    return this.companiesService.create(dto, request.user);
  }

  @Get()
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT)
  findAll(
    @Query() dto: FindCompaniesDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.companiesService.findAll(dto, request.user);
  }

  @Get('me')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  findMe(@Req() request: AuthenticatedRequest) {
    return this.companiesService.findMe(request.user);
  }

  @Get(':id/students')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  findHostedStudents(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.companiesService.findHostedStudents(id, request.user);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.companiesService.findOne(id, request.user);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCompanyDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.companiesService.update(id, dto, request.user);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMINISTRATEUR)
  deactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.companiesService.deactivate(id, request.user);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.companiesService.deactivate(id, request.user);
  }
}
