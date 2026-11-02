import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Space } from '../../spaces/entities/space.entity';
import { User } from '../../users/entities/user.entity';

export enum BookingStatus {
  PENDIENTE_APROBACION = 'PENDIENTE_APROBACION',
  APROBADA_POR_PROPIETARIO = 'APROBADA_POR_PROPIETARIO',
  CONFIRMADA_PAGADA = 'CONFIRMADA_PAGADA',
  RECHAZADA = 'RECHAZADA',
  CANCELADA = 'CANCELADA',
  FINALIZADA = 'FINALIZADA',
}

@Entity({ name: 'bookings' })
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'space_id', type: 'uuid' })
  spaceId: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDIENTE_APROBACION,
  })
  status: BookingStatus;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date;

  @Column({ type: 'text' })
  purpose: string;

  @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ name: 'platform_commission', type: 'numeric', precision: 12, scale: 2 })
  platformCommission: number;

  @ManyToOne(() => Space, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'space_id' })
  space: Space;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}