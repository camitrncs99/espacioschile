import { IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsUUID('4', { message: 'El ID del espacio debe ser un UUID válido' })
  spaceId: string;

  @IsDateString({}, { message: 'La fecha de inicio debe tener formato ISO válido' })
  startDate: string;

  @IsDateString({}, { message: 'La fecha de fin debe tener formato ISO válido' })
  endDate: string;

  @IsNotEmpty({ message: 'El propósito del arriendo es obligatorio' })
  @IsString()
  purpose: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, {
    message: 'El nuevo estado debe ser APROBADA_POR_PROPIETARIO o RECHAZADA',
  })
  status: BookingStatus;
}