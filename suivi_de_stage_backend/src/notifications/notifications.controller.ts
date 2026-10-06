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
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { SendStageReminderDto } from './dto/send-stage-reminder.dto';
import { NotificationsService } from './notifications.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('reminder')
  @Roles(Role.ADMINISTRATEUR)
  sendReminder(
    @Body() dto: SendStageReminderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notificationsService.sendStageReminder(
      dto.stageId,
      request.user,
    );
  }

  @Get()
  findAll(
    @Query() dto: FindNotificationsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notificationsService.findAll(dto, request.user);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notificationsService.markAsRead(id, request.user);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notificationsService.remove(id, request.user);
  }
}
