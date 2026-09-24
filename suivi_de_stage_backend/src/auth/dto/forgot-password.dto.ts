import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class ForgotPasswordDto {
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'L’adresse e-mail est invalide.' })
  email: string;
}
