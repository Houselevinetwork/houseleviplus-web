export interface IProductVariant {
  _id?: any;  // MongoDB ObjectId
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
  images: IProductImage[];
  variants: IProductVariant[];
  tags: string[];
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}