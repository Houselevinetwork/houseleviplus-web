export interface IProductVariant {
  _id: string;
  sku: string;
  title: string;
  color?: string;
  size?: string;
  edition?: string;
  price: number;
  stock: number;
  barcode?: string;
}

export interface IProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  collectionId: string;
  basePrice: number;
  currency: 'KES' | 'USD';
  discountPrice?: number;
  totalStock: number;
  lowStockThreshold: number;
  images: IProductImage[];
  variants: IProductVariant[];
  tags: string[];
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

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

export interface IShippingRate {
  _id: string;
  location: 'Kenya' | 'Africa' | 'International';
  flatRate: number;
  minOrderValue?: number;
  estimatedDays: number;
  isActive: boolean;
}
