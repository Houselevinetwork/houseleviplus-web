export interface IShippingRate {
  _id: string;
  location: 'Kenya' | 'Africa' | 'International';
  flatRate: number;
  minOrderValue?: number;
  estimatedDays: number;
  isActive: boolean;
}

export interface IShippingCostResponse {
  location: string;
  shippingCost: number;
  estimatedDays: number;
  estimatedDelivery: Date;
}
