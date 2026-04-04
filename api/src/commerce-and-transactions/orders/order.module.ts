import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../products/product.module';
import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CartModule,
    ProductModule,
    ShippingModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
