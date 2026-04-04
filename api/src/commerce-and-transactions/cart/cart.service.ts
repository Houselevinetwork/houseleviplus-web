import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './cart.schema';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  async getCart(userId: string) {
    let cart = await this.cartModel.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = await this.cartModel.create({ userId, items: [], itemCount: 0, subtotal: 0 });
    }
    return cart;
  }

  async addItem(userId: string, productId: string, variantId: string, variantTitle: string, price: number, quantity: number) {
    const cart = await this.getCart(userId);
    
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId && item.variantId.toString() === variantId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.price * existingItem.quantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(productId),
        variantId: new Types.ObjectId(variantId),
        variantTitle,
        quantity,
        price,
        subtotal: price * quantity,
        addedAt: new Date(),
      } as any);
    }

    this.updateCartTotals(cart);
    return cart.save();
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) return this.removeItem(userId, itemId);
    
    const cart = await this.getCart(userId);
    const item = cart.items.find(i => (i as any)._id?.toString() === itemId);
    if (!item) throw new BadRequestException('Item not found in cart');

    item.quantity = quantity;
    item.subtotal = item.price * quantity;
    this.updateCartTotals(cart);
    return cart.save();
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter(i => (i as any)._id?.toString() !== itemId);
    this.updateCartTotals(cart);
    return cart.save();
  }

  async clearCart(userId: string) {
    return this.cartModel.updateOne({ userId }, { items: [], itemCount: 0, subtotal: 0 });
  }

  private updateCartTotals(cart: any) {
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
}
