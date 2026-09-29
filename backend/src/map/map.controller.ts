import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { FindMapDto } from './dto/find-map.dto';
import { MapService } from './map.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('map')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('internships')
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT, Role.ENTREPRISE, Role.ENCADREUR)
  findInternships(
    @Query() filters: FindMapDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.mapService.findInternshipPoints(filters, request.user);
  }

  @Get('companies')
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT, Role.ENTREPRISE, Role.ENCADREUR)
  findCompanies(
    @Query() filters: FindMapDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.mapService.findCompanyPoints(filters, request.user);
  }
}
