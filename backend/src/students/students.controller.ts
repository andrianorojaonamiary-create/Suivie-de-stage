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
import { Role } from '../users/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateStudentDto } from './dto/create-student.dto';
import { FindStudentsDto } from './dto/find-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.ADMINISTRATEUR)
  create(
    @Body() createStudentDto: CreateStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.studentsService.create(createStudentDto, request.user);
  }

  @Get()
  findAll(
    @Query() findStudentsDto: FindStudentsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.studentsService.findAll(findStudentsDto, request.user);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.studentsService.findOne(id, request.user);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.studentsService.update(id, updateStudentDto, request.user);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.studentsService.remove(id, request.user);
  }
}
