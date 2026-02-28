import { create } from 'zustand';
import { storage, StorageKey } from '../storage';
import type { CartItem } from '../types/cart';

interface CartState {
  items: CartItem[];
}

interface CartActions {
  addItem: (item: CartItem) => void;
  increaseQuantity: (variantId: string) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
}

interface CartDerived {
  subtotal: () => number;
  totalPrice: () => number;
  totalItemCount: () => number;
}

type CartStore = CartState & CartActions & CartDerived;

function parseAmount(amount: string): number {
  return parseFloat(amount);
}

function persistItems(items: CartItem[]): void {
  storage.set<CartItem[]>(StorageKey.CART, items);
}

function loadItems(): CartItem[] {
  return storage.get<CartItem[]>(StorageKey.CART) ?? [];
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: loadItems(),

  addItem: (item: CartItem): void => {
    const existing = get().items.find(i => i.variantId === item.variantId);
    let next: CartItem[];
    if (existing !== undefined) {
      next = get().items.map(i =>
        i.variantId === item.variantId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i,
      );
    } else {
      next = [...get().items, item];
    }
    persistItems(next);
    set({ items: next });
  },

  increaseQuantity: (variantId: string): void => {
    const next = get().items.map(i =>
      i.variantId === variantId ? { ...i, quantity: i.quantity + 1 } : i,
    );
    persistItems(next);
    set({ items: next });
  },

  removeItem: (variantId: string): void => {
    const next = get().items.filter(i => i.variantId !== variantId);
    persistItems(next);
    set({ items: next });
  },

  clearCart: (): void => {
    storage.delete(StorageKey.CART);
    set({ items: [] });
  },

  subtotal: (): number => {
    return get().items.reduce(
      (sum, item) => sum + parseAmount(item.price.amount) * item.quantity,
      0,
    );
  },

  totalPrice: (): number => {
    return get().subtotal();
  },

  totalItemCount: (): number => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
