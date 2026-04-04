import { API_BASE_URL, API_ENDPOINTS } from './config';
import { IShippingRate, IShippingCostResponse } from '../types';

export class ShippingService {
  static async getShippingRates(): Promise<IShippingRate[]> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SHIPPING_RATES}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch shipping rates');
      return response.json();
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      throw error;
    }
  }

  static async calculateShippingCost(
    location: 'Kenya' | 'Africa' | 'International',
    orderValue: number
  ): Promise<IShippingCostResponse> {
    try {
      // In real implementation, call backend
      // For now, local calculation
      const rates = await this.getShippingRates();
      const rate = rates.find((r) => r.location === location);

      if (!rate) {
        throw new Error('Shipping not available for this location');
      }

      const shippingCost =
        rate.minOrderValue && orderValue >= rate.minOrderValue ? 0 : rate.flatRate;
      const estimatedDelivery = new Date(Date.now() + rate.estimatedDays * 24 * 60 * 60 * 1000);

      return {
        location,
        shippingCost,
        estimatedDays: rate.estimatedDays,
        estimatedDelivery,
      };
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  }
}
