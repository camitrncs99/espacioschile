import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum PaymentStatus {
  INICIADO = 'INICIADO',
  EN_CUSTODIA_WEBPAY = 'EN_CUSTODIA_WEBPAY',
  LIBERADO_A_PROPIETARIO = 'LIBERADO_A_PROPIETARIO',
  REEMBOLSADO = 'REEMBOLSADO',
  FALLIDO = 'FALLIDO',
}

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid', unique: true })
  bookingId: string;

  @Column({ name: 'buy_order', length: 64, unique: true })
  buyOrder: string;

  @Column({ name: 'session_id', length: 64 })
  sessionId: string;

  @Column({ name: 'tbk_token', length: 255, unique: true, nullable: true })
  tbkToken: string;

  @Column({ name: 'authorization_code', length: 50, nullable: true })
  authorizationCode: string;

  @Column({ name: 'card_last_digits', length: 4, nullable: true })
  cardLastDigits: string;

  @Column({ name: 'payment_type', length: 10, nullable: true })
  paymentType: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.INICIADO,
  })
  status: PaymentStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'transbank_response', type: 'jsonb', nullable: true })
  transbankResponse: any;

  @OneToOne(() => Booking, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}