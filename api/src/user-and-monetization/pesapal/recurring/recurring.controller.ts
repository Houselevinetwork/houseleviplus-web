import { 
  Controller, 
  Post, 
  Body, 
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException 
} from '@nestjs/common';
import { PesapalRecurringService } from './pesapal-recurring.service';
import { StartRecurringDto } from '../dto/start-recurring.dto';
import { HandleIpnDto } from '../dto/handle-ipn.dto';
import { CancelRecurringDto } from '../dto/cancel-recurring.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('recurring-payments')
export class RecurringController {
  constructor(private recurringService: PesapalRecurringService) {}

  /**
   * @route POST /recurring-payments/start
   * @description Start a new recurring payment subscription
   * @access Protected (JWT required)
   */
  @UseGuards(JwtAuthGuard)
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async startRecurringPayment(
    @Body() dto: StartRecurringDto,
    @CurrentUser() user: any,
  ) {
    if (!user) {
      throw new BadRequestException('User not authenticated');
    }
    return this.recurringService.startRecurringPayment(dto, user);
  }

  /**
   * @route POST /recurring-payments/ipn-callback
   * @description Handle PesaPal IPN callback for recurring payments
   * @access Public
   * @note This is called by PesaPal servers, not clients
   */
  @Post('ipn-callback')
  @HttpCode(HttpStatus.OK)
  async handleIPNCallback(@Body() dto: HandleIpnDto) {
    if (!dto.OrderTrackingId || !dto.OrderNotificationType) {
      throw new BadRequestException('Missing required IPN fields');
    }
    return this.recurringService.handleRecurringIPN(dto);
  }

  /**
   * @route POST /recurring-payments/cancel
   * @description Cancel an active recurring subscription
   * @access Protected (JWT required)
   */
  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelRecurringPayment(@Body() dto: CancelRecurringDto) {
    if (!dto.subscriptionId || !dto.userId) {
      throw new BadRequestException('Missing required cancellation fields');
    }
    return this.recurringService.cancelRecurringPayment(dto);
  }
}

