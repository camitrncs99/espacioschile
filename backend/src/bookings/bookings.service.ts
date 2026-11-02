import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Space, PricingModality } from '../spaces/entities/space.entity';
import { User } from '../users/entities/user.entity';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectRepository(Space)
    private readonly spacesRepository: Repository<Space>,
  ) {}

  async create(createDto: CreateBookingDto, client: User): Promise<Booking> {
    const space = await this.spacesRepository.findOne({
      where: { id: createDto.spaceId, isPublished: true, isModerated: true },
    });

    if (!space) {
      throw new NotFoundException('El espacio solicitado no existe o no está publicado');
    }

    if (space.ownerId === client.id) {
      throw new BadRequestException('No puedes solicitar una reserva de tu propio espacio');
    }

    const start = new Date(createDto.startDate);
    const end = new Date(createDto.endDate);

    if (start >= end) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    if (start < new Date()) {
      throw new BadRequestException('No se pueden agendar reservas en fechas pasadas');
    }

    // 1. Validar solapamiento con reservas confirmadas o ya aprobadas
    const conflictingBooking = await this.bookingsRepository
      .createQueryBuilder('booking')
      .where('booking.space_id = :spaceId', { spaceId: space.id })
      .andWhere('booking.status IN (:...activeStatuses)', {
        activeStatuses: [
          BookingStatus.CONFIRMADA_PAGADA,
          BookingStatus.APROBADA_POR_PROPIETARIO,
        ],
      })
      .andWhere('booking.start_date < :end AND booking.end_date > :start', {
        start,
        end,
      })
      .getOne();

    if (conflictingBooking) {
      throw new BadRequestException(
        'El espacio ya se encuentra reservado en el rango de fechas seleccionado',
      );
    }

    // 2. Cálculo dinámico de tarifa según la modalidad
    let totalAmount = 0;
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (space.pricingMode === PricingModality.HORA) {
      if (!space.pricePerHour) {
        throw new BadRequestException('El espacio no tiene tarifa configurada por hora');
      }
      totalAmount = Math.ceil(diffHours) * Number(space.pricePerHour);
    } else if (space.pricingMode === PricingModality.DIA) {
      if (!space.pricePerDay) {
        throw new BadRequestException('El espacio no tiene tarifa configurada por día');
      }
      const diffDays = Math.max(1, Math.ceil(diffHours / 24));
      totalAmount = diffDays * Number(space.pricePerDay);
    } else if (space.pricingMode === PricingModality.MES) {
      if (!space.pricePerMonth) {
        throw new BadRequestException('El espacio no tiene tarifa configurada por mes');
      }
      const diffMonths = Math.max(1, Math.ceil(diffHours / (24 * 30)));
      totalAmount = diffMonths * Number(space.pricePerMonth);
    } else {
      // Flexible o por defecto cálculo diario
      totalAmount = Math.max(1, Math.ceil(diffHours / 24)) * Number(space.pricePerDay || 50000);
    }

    // Comisión de intermediación de la plataforma (10%)
    const platformCommission = Math.round(totalAmount * 0.1);

    const booking = this.bookingsRepository.create({
      spaceId: space.id,
      clientId: client.id,
      startDate: start,
      endDate: end,
      purpose: createDto.purpose,
      totalAmount,
      platformCommission,
      status: BookingStatus.PENDIENTE_APROBACION,
    });

    return await this.bookingsRepository.save(booking);
  }

  // Listar reservas realizadas por el cliente actual
  async findMyBookings(client: User): Promise<Booking[]> {
    return await this.bookingsRepository.find({
      where: { clientId: client.id },
      relations: ['space'],
      order: { createdAt: 'DESC' },
    });
  }

  // Listar solicitudes recibidas para los espacios de un propietario
  async findOwnerRequests(owner: User): Promise<Booking[]> {
    return await this.bookingsRepository
      .createQueryBuilder('booking')
      .innerJoinAndSelect('booking.space', 'space')
      .innerJoinAndSelect('booking.client', 'client')
      .where('space.owner_id = :ownerId', { ownerId: owner.id })
      .orderBy('booking.created_at', 'DESC')
      .getMany();
  }

  // Modificar estado (Aprobar / Rechazar por el dueño)
  async updateStatus(
    id: string,
    updateDto: UpdateBookingStatusDto,
    owner: User,
  ): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['space'],
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (booking.space.ownerId !== owner.id) {
      throw new ForbiddenException('No tienes permiso para gestionar esta reserva');
    }

    if (booking.status !== BookingStatus.PENDIENTE_APROBACION) {
      throw new BadRequestException(
        `No se puede cambiar el estado de una reserva que ya está en ${booking.status}`,
      );
    }

    booking.status = updateDto.status;
    return await this.bookingsRepository.save(booking);
  }
}