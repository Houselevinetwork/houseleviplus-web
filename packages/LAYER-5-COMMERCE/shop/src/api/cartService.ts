import { API_BASE_URL, API_ENDPOINTS } from './config';
import { ICart, IAddToCartRequest, IUpdateCartItemRequest } from '../types';

export class CartService {
  static async getCart(token: string): Promise<ICart> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CART}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  static async addToCart(token: string, data: IAddToCartRequest): Promise<ICart> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CART_ADD_ITEM}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  static async updateCartItem(token: string, itemId: string, data: IUpdateCartItemRequest): Promise<ICart> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CART_UPDATE_ITEM(itemId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update cart item');
      return response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  static async removeFromCart(token: string, itemId: string): Promise<ICart> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CART_REMOVE_ITEM(itemId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to remove from cart');
      return response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  static async clearCart(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CART_CLEAR}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to clear cart');
      return response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}
