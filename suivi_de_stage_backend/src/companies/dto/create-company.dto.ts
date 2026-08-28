import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { CompanyStatus } from '../enums/company-status.enum';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateCompanyDto {
  @IsUUID()
  userId: string;

  @Transform(trim)
  @IsString()
  @Length(2, 150)
  nom: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  description?: string;

  @Transform(trim)
  @IsString()
  @Length(2, 150)
  secteurActivite: string;

  @Transform(trim)
  @IsString()
  @Length(2, 255)
  adresse: string;

  @Transform(trim)
  @IsString()
  @Length(2, 100)
  ville: string;

  @Transform(trim)
  @IsString()
  @Length(2, 100)
  region: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @Length(5, 30)
  telephone?: string;

  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @Transform(trim)
  @IsOptional()
  @IsUrl({ require_tld: false })
  @Length(3, 255)
  siteWeb?: string;

  @Type(() => Number)
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @Type(() => Number)
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsEnum(CompanyStatus)
  statut?: CompanyStatus;
}
