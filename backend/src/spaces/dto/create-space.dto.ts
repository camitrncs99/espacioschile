import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SpaceCategory, PricingModality } from '../entities/space.entity';

export class CreateSpaceDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  description: string;

  @IsEnum(SpaceCategory)
  category: SpaceCategory;

  @IsNotEmpty({ message: 'La subcategoría es obligatoria' })
  @IsString()
  subCategory: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  surfaceM2: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacityPeople?: number;

  @IsNotEmpty()
  @IsString()
  addressStreet: string;

  @IsNotEmpty()
  @IsString()
  commune: string;

  @IsOptional()
  @IsString()
  region?: string = 'Metropolitana';

  @Type(() => Number)
  @IsNumber()
  lat: number;

  @Type(() => Number)
  @IsNumber()
  lng: number;

  @IsEnum(PricingModality)
  pricingMode: PricingModality;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerHour?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerDay?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerMonth?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}