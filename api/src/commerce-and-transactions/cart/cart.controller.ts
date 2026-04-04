import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from '../../user-and-monetization/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';

@Controller('commerce/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user._id);
  }

  @Post('items')
  async addItem(@CurrentUser() user: any, @Body() body: any) {
    return this.cartService.addItem(
      user._id,
      body.productId,
      body.variantId,
      body.variantTitle,
      body.price,
      body.quantity,
    );
  }

  @Patch('items/:itemId')
  async updateQuantity(
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(user._id, itemId, body.quantity);
  }

  @Delete('items/:itemId')
  async removeItem(@CurrentUser() user: any, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user._id, itemId);
  }

  @Delete()
  async clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user._id);
  }
}
