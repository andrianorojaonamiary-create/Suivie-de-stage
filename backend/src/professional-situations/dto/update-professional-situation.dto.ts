import { PartialType } from '@nestjs/mapped-types';
import { CreateProfessionalSituationDto } from './create-professional-situation.dto';

export class UpdateProfessionalSituationDto extends PartialType(
  CreateProfessionalSituationDto,
) {}
