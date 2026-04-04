import { Module } from '@nestjs/common';
import { CollectionModule } from './collections/collection.module';
import { ProductModule } from './products/product.module';
import { ShippingModule } from './shipping/shipping.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './orders/order.module';
import { AdminModule } from './admin/admin.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [
    CollectionModule,
    ProductModule,
    ShippingModule,
    CartModule,
    OrderModule,
    AdminModule,
    ShopModule,
  ],
  exports: [
    CollectionModule,
    ProductModule,
    ShippingModule,
    CartModule,
    OrderModule,
    AdminModule,
    ShopModule,
  ],
})
export class CommerceAndTransactionsModule {}