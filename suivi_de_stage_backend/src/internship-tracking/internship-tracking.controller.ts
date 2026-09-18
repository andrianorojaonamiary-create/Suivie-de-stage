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
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { FindFollowUpsDto } from './dto/find-follow-ups.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { InternshipTrackingService } from './internship-tracking.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('internship-tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternshipTrackingController {
  constructor(private readonly trackingService: InternshipTrackingService) {}

  @Post('internships/:internshipId')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  create(
    @Param('internshipId', new ParseUUIDPipe()) internshipId: string,
    @Body() dto: CreateFollowUpDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.trackingService.create(internshipId, dto, request.user);
  }

  @Get('internships/:internshipId')
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT, Role.ENCADREUR)
  findAll(
    @Param('internshipId', new ParseUUIDPipe()) internshipId: string,
    @Query() dto: FindFollowUpsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.trackingService.findAll(internshipId, dto, request.user);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateFollowUpDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.trackingService.update(id, dto, request.user);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.trackingService.remove(id, request.user);
  }
}
