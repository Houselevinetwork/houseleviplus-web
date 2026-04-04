export interface IOrderItem {
  _id: string;
  productId: string;
  variantId: string;
  variantTitle: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zipCode?: string;
  country: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: 'KES' | 'USD';
  shippingAddress: IShippingAddress;
  shippingLocation: 'Kenya' | 'Africa' | 'International';
  estimatedDelivery?: Date;
  paymentMethod: string;
  pesapalReference?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrderRequest {
  phone: string;
  shippingLocation: 'Kenya' | 'Africa' | 'International';
  currency: 'KES' | 'USD';
  shippingAddress: IShippingAddress;
}

export interface ICreateOrderResponse {
  orderId: string;
  pesapalUrl: string;
  total: number;
}
