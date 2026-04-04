import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrderService } from '../orders/order.service';
import { InvoiceService } from './invoice.service';
import { RolesGuard } from '../../user-and-monetization/auth/guards/roles.guard';
import { Roles } from '../../user-and-monetization/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';
import { AddTrackingDto, UpdateOrderStatusDto, RefundOrderDto } from '../dtos/admin.dto';

@Controller('admin/commerce/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminOrderController {
  constructor(
    private orderService: OrderService,
    private invoiceService: InvoiceService,
  ) {}

  @Get()
  async getAllOrders(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    if (status) {
      return this.orderService.findByStatus(status, skip, limit);
    }
    return this.orderService.getAllOrders(skip, limit);
  }

  @Get('stats')
  async getOrderStats() {
    return this.orderService.getOrderStats();
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateOrderStatus(id, dto.orderStatus);
    // TODO: Send notification to customer
    return order;
  }

  @Patch(':id/tracking')
  async addTracking(
    @Param('id') id: string,
    @Body() dto: AddTrackingDto,
  ) {
    return this.orderService.updateOrderTracking(
      id,
      dto.trackingNumber,
      dto.trackingUrl,
    );
  }

  @Post(':id/invoice')
  async generateInvoice(@Param('id') id: string) {
    const order = await this.orderService.getOrderById(id);
    const invoicePDF = this.invoiceService.generateInvoicePDF(order);
    // TODO: Send invoice to customer email
    return { success: true, message: invoicePDF };
  }

  @Patch(':id/refund')
  async refundOrder(
    @Param('id') id: string,
    @Body() dto: RefundOrderDto,
  ) {
    const order = await this.orderService.getOrderById(id);
    const refundAmount = this.invoiceService.calculateRefundAmount(
      order,
      dto.refundAmount,
    );

    // TODO: Process refund through PesaPal
    const updatedOrder = await this.orderService.update(id, {
      orderStatus: 'cancelled',
      refundAmount,
      refundReason: dto.reason,
    });

    return updatedOrder;
  }
}