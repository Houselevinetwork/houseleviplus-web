import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ShippingService } from '../shipping/shipping.service';
import { RolesGuard } from '../../user-and-monetization/auth/guards/roles.guard';
import { Roles } from '../../user-and-monetization/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';

@Controller('admin/commerce/shipping')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get()
  async getAllRates() {
    return this.shippingService.getAllRates();
  }

  @Get(':location')
  async getRate(@Param('location') location: string) {
    return this.shippingService.getRate(location as any);
  }

  @Post()
  async createRate(@Body() dto: any) {
    return this.shippingService.setRate(
      dto.location,
      dto.flatRate,
      dto.minOrderValue,
    );
  }

  @Patch(':location')
  async updateRate(
    @Param('location') location: string,
    @Body() dto: any,
  ) {
    return this.shippingService.setRate(
      location as any,
      dto.flatRate,
      dto.minOrderValue,
    );
  }

  @Patch(':location/activate')
  async activateRate(@Param('location') location: string) {
    return this.shippingService.updateStatus(location as any, true);
  }

  @Patch(':location/deactivate')
  async deactivateRate(@Param('location') location: string) {
    return this.shippingService.updateStatus(location as any, false);
  }
}