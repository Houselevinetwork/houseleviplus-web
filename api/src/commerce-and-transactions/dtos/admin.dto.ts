export class GenerateInvoiceDto {
  orderId: string;
  includeShipping?: boolean;
}

export class RefundOrderDto {
  orderId: string;
  reason: string;
  refundAmount?: number;
}

export class UpdateOrderStatusDto {
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
}

export class AddTrackingDto {
  trackingNumber: string;
  trackingUrl: string;
}

export class BulkUploadProductDto {
  products: Array<{
    title: string;
    slug: string;
    description: string;
    collectionId: string;
    basePrice: number;
    variants: Array<{
      sku: string;
      title: string;
      color?: string;
      size?: string;
      edition?: string;
      price: number;
      stock: number;
    }>;
    images: Array<{
      url: string;
      alt: string;
      isPrimary?: boolean;
    }>;
  }>;
}
