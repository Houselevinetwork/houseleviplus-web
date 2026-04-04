import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../products/product.service';
import { ShippingService } from '../shipping/shipping.service';
import { CurrentUser } from '../../user-and-monetization/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';

@Controller('commerce/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private productService: ProductService,
    private shippingService: ShippingService,
  ) {}

  @Get()
  async getUserOrders(@CurrentUser() user: any) {
    return this.orderService.getUserOrders(user._id);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Post()
  async createOrder(@CurrentUser() user: any, @Body() body: any) {
    const cart = await this.cartService.getCart(user._id);
    if (cart.items.length === 0) throw new Error('Cart is empty');

    const shippingCost = await this.shippingService.calculateCost(
      body.shippingLocation,
      cart.subtotal,
    );

    const order = await this.orderService.createOrder({
      userId: user._id,
      customerEmail: user.email,
      customerPhone: body.phone,
      items: cart.items,
      subtotal: cart.subtotal,
      shippingCost,
      total: cart.subtotal + shippingCost,
      shippingAddress: body.shippingAddress,
      shippingLocation: body.shippingLocation,
      currency: body.currency || 'KES',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    // Decrease stock for each item
    for (const item of cart.items) {
      await this.productService.decreaseStock(
        item.productId.toString(),
        item.variantId.toString(),
        item.quantity,
      );
    }

    // Clear cart
    await this.cartService.clearCart(user._id);

    return { orderId: order._id, pesapalUrl: 'https://sandbox.pesapal.com/checkout' };
  }
}
