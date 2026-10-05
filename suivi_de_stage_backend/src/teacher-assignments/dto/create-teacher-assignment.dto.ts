import { IsUUID } from 'class-validator';

export class CreateTeacherAssignmentDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  teacherId: string;
}
