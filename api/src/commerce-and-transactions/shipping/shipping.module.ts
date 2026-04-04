import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingRate, ShippingSchema } from './shipping.schema';
import { ShippingService } from './shipping.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: ShippingRate.name, schema: ShippingSchema }])],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
