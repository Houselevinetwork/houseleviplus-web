import { create } from 'zustand';
import { ICart, ICartItem } from '@houselevi/shop';

interface CartStore {
  cart: ICart | null;
  setCart: (cart: ICart) => void;
  addItem: (item: ICartItem) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
  addItem: (item) => set((state) => ({
    cart: state.cart ? { ...state.cart, items: [...state.cart.items, item] } : null,
  })),
  removeItem: (itemId) => set((state) => ({
    cart: state.cart ? {
      ...state.cart,
      items: state.cart.items.filter((i) => i._id !== itemId),
    } : null,
  })),
  clearCart: () => set({ cart: null }),
}));
