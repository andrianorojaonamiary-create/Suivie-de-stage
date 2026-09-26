import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import { StatisticsService } from './statistics.service';
import { FindStatisticsDto } from './dto/find-statistics.dto';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRATEUR)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  getDashboard(@Query() dto: FindStatisticsDto) {
    return this.statisticsService.getDashboard(dto);
  }

  @Get('overview')
  getOverview(@Query() dto: FindStatisticsDto) {
    return this.statisticsService.getOverview(dto);
  }

  @Get('internships')
  getInternships(@Query() dto: FindStatisticsDto) {
    return this.statisticsService.getInternshipStatistics(dto);
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