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
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';
import { FindTeacherAssignmentsDto } from './dto/find-teacher-assignments.dto';
import { UpdateTeacherAssignmentDto } from './dto/update-teacher-assignment.dto';
import { TeacherAssignmentsService } from './teacher-assignments.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('teacher-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherAssignmentsController {
  constructor(private readonly assignmentsService: TeacherAssignmentsService) {}

  // Selecteur du formulaire stage cote etudiant : uniquement les enseignants
  // qui lui sont affectes. L'etudiant est deduit du JWT.
  @Get('my-teachers')
  @Roles(Role.ETUDIANT)
  findMyTeachers(@Req() request: AuthenticatedRequest) {
    return this.assignmentsService.findMyTeachers(request.user);
  }

  // Doit etre declare avant ':id' pour ne pas etre capture par le parametre.
  @Get('options')
  @Roles(Role.ADMINISTRATEUR)
  getOptions() {
    return this.assignmentsService.getOptions();
  }

  @Get('unassigned')
  @Roles(Role.ADMINISTRATEUR)
  findUnassignedStudents() {
    return this.assignmentsService.findUnassignedStudents();
  }

  @Get()
  @Roles(Role.ADMINISTRATEUR)
  findAll(@Query() dto: FindTeacherAssignmentsDto) {
    return this.assignmentsService.findAll(dto);
  }

  @Get('student/:studentId')
  @Roles(Role.ADMINISTRATEUR)
  findByStudent(@Param('studentId', new ParseUUIDPipe()) studentId: string) {
    return this.assignmentsService.findByStudent(studentId);
  }

  @Get('teacher/:teacherId')
  @Roles(Role.ADMINISTRATEUR)
  findByTeacher(@Param('teacherId', new ParseUUIDPipe()) teacherId: string) {
    return this.assignmentsService.findByTeacher(teacherId);
  }

  @Post()
  @Roles(Role.ADMINISTRATEUR)
  create(
    @Body() dto: CreateTeacherAssignmentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.assignmentsService.create(dto, request.user);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRATEUR)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTeacherAssignmentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.assignmentsService.update(id, dto, request.user);
  }

  // Cloture logique (date_fin) plutot qu'une suppression : l'historique des
  // remplacements de tuteur est conserve.
  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.assignmentsService.remove(id);
  }
}
