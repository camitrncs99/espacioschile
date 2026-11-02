import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class InitiateTransactionDto {
  @IsUUID('4', { message: 'El ID de la reserva debe ser un UUID válido' })
  bookingId: string;
}

export class ConfirmTransactionDto {
  @IsNotEmpty()
  @IsString()
  tbkToken: string;
}