import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const strip = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class VerifyResetCodeDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'L’adresse e-mail est invalide.' })
  email: string;

  @Transform(strip)
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Le code doit contenir exactement 6 chiffres.',
  })
  code: string;
}
