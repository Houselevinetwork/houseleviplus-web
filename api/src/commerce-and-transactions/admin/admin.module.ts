import { Module } from '@nestjs/common';
import { AdminProductController } from './admin-product.controller';
import { AdminOrderController } from './admin-order.controller';
import { AdminCollectionController } from './admin-collection.controller';
import { AdminShippingController } from './admin-shipping.controller';
import { InvoiceService } from './invoice.service';
import { ProductModule } from '../products/product.module';
import { OrderModule } from '../orders/order.module';
import { CollectionModule } from '../collections/collection.module';
import { ShippingModule } from '../shipping/shipping.module';
import { RoleModule } from '../../user-and-monetization/role/role.module';

@Module({
  imports: [
    ProductModule,
    OrderModule,
    CollectionModule,
    ShippingModule,
    RoleModule, // ← ADD THIS for RolesGuard dependency
  ],
  controllers: [
    AdminProductController,
    AdminOrderController,
    AdminCollectionController,
    AdminShippingController,
  ],
  providers: [InvoiceService],
})
export class AdminModule {}