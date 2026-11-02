import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpacesModule } from './spaces/spaces.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Space } from './spaces/entities/space.entity';
import { User } from './users/entities/user.entity';
import { SpaceImage } from './spaces/entities/space-image.entity';
import { SpaceAmenity } from './spaces/entities/space-amenity.entity';
import { BookingsModule } from './bookings/bookings.module';
import { Booking } from './bookings/entities/booking.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgrespassword',
      database: process.env.DB_NAME || 'espacioschile_db',
      entities: [Space, User, SpaceImage, SpaceAmenity, Booking, Transaction],
      synchronize: false,
    }),
    SpacesModule,
    UsersModule,
    AuthModule,
    BookingsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}