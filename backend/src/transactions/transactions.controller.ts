import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { InitiateTransactionDto, ConfirmTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiate(
    @Body() initiateDto: InitiateTransactionDto,
    @CurrentUser() user: User,
  ) {
    return await this.transactionsService.initiate(initiateDto, user);
  }

  @Post('confirm')
  async confirm(@Body() confirmDto: ConfirmTransactionDto) {
    return await this.transactionsService.confirm(confirmDto);
  }
}