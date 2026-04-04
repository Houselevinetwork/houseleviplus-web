import { API_BASE_URL, API_ENDPOINTS } from './config';
import { IOrder, ICreateOrderRequest, ICreateOrderResponse } from '../types';

export class OrderService {
  static async createOrder(token: string, data: ICreateOrderRequest): Promise<ICreateOrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE_ORDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create order');
      return response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async getUserOrders(token: string): Promise<IOrder[]> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  static async getOrderById(token: string, orderId: string): Promise<IOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDER_BY_ID(orderId)}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Order not found');
      return response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }
}
