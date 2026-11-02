import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // 1. Crear solicitud de reserva (Cliente)
  @Post()
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: User,
  ) {
    return await this.bookingsService.create(createBookingDto, user);
  }

  // 2. Obtener historial de arriendos del cliente logueado
  @Get('my-bookings')
  async getMyBookings(@CurrentUser() user: User) {
    return await this.bookingsService.findMyBookings(user);
  }

  // 3. Obtener solicitudes de reserva recibidas (Panel Propietario)
  @Get('owner-requests')
  async getOwnerRequests(@CurrentUser() user: User) {
    return await this.bookingsService.findOwnerRequests(user);
  }

  // 4. Aprobar o rechazar reserva (Propietario)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateBookingStatusDto,
    @CurrentUser() user: User,
  ) {
    return await this.bookingsService.updateStatus(id, updateDto, user);
  }
}