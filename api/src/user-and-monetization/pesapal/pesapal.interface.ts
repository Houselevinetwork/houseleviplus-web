export interface IPesapalOrder {
  _id?: string;
  userId: string;
  planType: 'monthly' | 'quarterly' | 'half_year' | 'yearly';
  amount: number;
  orderStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  pesapalOrderTrackingId?: string;
  pesapalOrderMerchantRef?: string;
  customerEmail: string;
  customerPhone: string;
  customerFirstName: string;
  customerLastName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPesapalAuthToken {
  token: string;
  expiresIn: number;
  expiresAt: number;
}