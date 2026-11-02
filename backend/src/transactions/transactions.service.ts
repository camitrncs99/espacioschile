import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, PaymentStatus } from './entities/transaction.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { InitiateTransactionDto, ConfirmTransactionDto } from './dto/transaction.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
  ) {}

  async initiate(dto: InitiateTransactionDto, client: User) {
    const booking = await this.bookingsRepository.findOne({
      where: { id: dto.bookingId, clientId: client.id },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (booking.status !== BookingStatus.PENDIENTE_APROBACION && booking.status !== BookingStatus.APROBADA_POR_PROPIETARIO) {
      throw new BadRequestException('La reserva no está en un estado válido para pago');
    }

    // Simulamos la respuesta inicial de Webpay
    const buyOrder = `BO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const sessionId = `S-${Date.now()}`;
    const tbkToken = `simulated_token_${buyOrder}`;

    const transaction = this.transactionsRepository.create({
      bookingId: booking.id,
      buyOrder,
      sessionId,
      tbkToken,
      amount: booking.totalAmount,
      status: PaymentStatus.INICIADO,
    });

    await this.transactionsRepository.save(transaction);

    return {
      url: 'https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions',
      token: tbkToken,
    };
  }

  async confirm(dto: ConfirmTransactionDto) {
    const transaction = await this.transactionsRepository.findOne({
      where: { tbkToken: dto.tbkToken },
      relations: ['booking'],
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (transaction.status !== PaymentStatus.INICIADO) {
      throw new BadRequestException('La transacción ya fue procesada');
    }

    // Simular confirmación exitosa
    transaction.status = PaymentStatus.EN_CUSTODIA_WEBPAY;
    transaction.authorizationCode = Math.floor(100000 + Math.random() * 900000).toString();
    transaction.cardLastDigits = '6623';
    transaction.paymentType = 'VN';
    transaction.transbankResponse = { responseCode: 0, status: 'AUTHORIZED' };

    await this.transactionsRepository.save(transaction);

    // Actualizar la reserva a pagada
    transaction.booking.status = BookingStatus.CONFIRMADA_PAGADA;
    await this.bookingsRepository.save(transaction.booking);

    return transaction;
  }
}