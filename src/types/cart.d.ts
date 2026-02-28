import { Money, ProductImage } from "./product";

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: Money;
  image?: ProductImage | null;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}
