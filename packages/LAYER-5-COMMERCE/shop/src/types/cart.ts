export interface ICartItem {
  _id: string;
  productId: string;
  variantId: string;
  variantTitle: string;
  quantity: number;
  price: number;
  subtotal: number;
  addedAt: Date;
}

export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
  itemCount: number;
  subtotal: number;
  expiresAt: Date;
}

export interface IAddToCartRequest {
  productId: string;
  variantId: string;
  variantTitle: string;
  price: number;
  quantity: number;
}

export interface IUpdateCartItemRequest {
  quantity: number;
}
