import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Filtre optionnel par période (année scolaire) et/ou promotion.
 * Les bornes sont inclusives et portent sur internship.date_debut.
 */
export class FindStatisticsDto {
  @IsOptional()
  @IsDateString()
  debut?: string;

  @IsOptional()
  @IsDateString()
  fin?: string;

  @IsOptional()
  @IsString()
  promotion?: string;
}