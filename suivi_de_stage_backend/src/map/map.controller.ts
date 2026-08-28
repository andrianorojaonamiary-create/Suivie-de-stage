import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  findInternships(
    @Query() filters: FindMapDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.mapService.findInternshipPoints(filters, request.user);
  }

  @Get('companies')
  findCompanies(@Query() filters: FindMapDto) {
    return this.mapService.findCompanyPoints(filters);
  }
}
