import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SpaceCategory } from '../entities/space.entity';

export class SearchSpacesDto {
  @IsOptional()
  @IsString()
  commune?: string;

  @IsOptional()
  @IsEnum(SpaceCategory)
  category?: SpaceCategory;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // Parámetros para búsqueda espacial (PostGIS)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100) // Mínimo 100 metros
  radiusMeters?: number = 5000; // Por defecto 5 km (5.000 metros)
}