import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './order.schema';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async createOrder(data: any) {
    const orderNumber = `HL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    
    const order = new this.orderModel({
      orderNumber,
      ...data,
    });

    return order.save();
  }

  async getOrderById(id: string) {
    return this.orderModel.findById(id).populate('items.productId');
  }

  async getUserOrders(userId: string) {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findByStatus(status: string, skip: number = 0, limit: number = 10) {
    return this.orderModel
      .find({ orderStatus: status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.orderModel.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
  }

  async updateOrderTracking(id: string, trackingNumber: string, trackingUrl: string) {
    return this.orderModel.findByIdAndUpdate(
      id,
      { trackingNumber, trackingUrl },
      { new: true },
    );
  }

  async updatePaymentStatus(id: string, status: string, pesapalReference?: string) {
    const updateData: any = { paymentStatus: status };
    if (pesapalReference) updateData.pesapalReference = pesapalReference;
    if (status === 'completed') updateData.orderStatus = 'processing';
    
    return this.orderModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getAllOrders(skip: number = 0, limit: number = 10) {
    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email firstName lastName');
  }

  async update(id: string, data: any) {
    return this.orderModel.findByIdAndUpdate(id, data, { new: true });
  }

  async getOrderStats() {
    return this.orderModel.aggregate([
      { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$total' } } },
    ]);
  }
}
