export interface ICartItem { id: string; name: string; price: number; qty: number; imageUrl?: string; [key: string]: any; }
export interface ICart { items: ICartItem[]; total: number; }