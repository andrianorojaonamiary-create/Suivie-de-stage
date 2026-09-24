import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRATEUR)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.statisticsService.getDashboard();
  }

  @Get('internships')
  getInternships() {
    return this.statisticsService.getInternshipStatistics();
  }

  @Get('employment')
  getEmployment() {
    return this.statisticsService.getEmploymentStatistics();
  }

  @Get('geography')
  getGeography() {
    return this.statisticsService.getGeographyStatistics();
  }
}
