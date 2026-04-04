import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShippingRate } from './shipping.schema';

type LocationType = 'Kenya' | 'Africa' | 'International';

@Injectable()
export class ShippingService {
  constructor(
    @InjectModel(ShippingRate.name) private shippingModel: Model<ShippingRate>,
  ) {}

  async getRate(location: LocationType) {
    return this.shippingModel.findOne({ location, isActive: true });
  }

  async getAllRates() {
    return this.shippingModel.find({ isActive: true });
  }

  async calculateCost(location: LocationType, orderValue: number) {
    const rate = await this.getRate(location);
    if (!rate) return 0;
    if (rate.minOrderValue && orderValue >= rate.minOrderValue) return 0;
    return rate.flatRate;
  }

  async setRate(location: LocationType, flatRate: number, minOrderValue?: number) {
    return this.shippingModel.findOneAndUpdate(
      { location },
      { flatRate, minOrderValue },
      { upsert: true, new: true },
    );
  }

  async updateStatus(location: LocationType, isActive: boolean) {
    return this.shippingModel.findOneAndUpdate(
      { location },
      { isActive },
      { new: true },
    );
  }
}
