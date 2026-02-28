export interface Money {
  amount: string;
  currencyCode: string;
}

export interface PriceRange {
  minVariantPrice: Money;
  maxVariantPrice: Money;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

export interface MediaImage {
  url: string;
  id: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ProductMedia {
  mediaContentType: string;
  image: MediaImage;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface VariantProduct {
  id: string;
  handle: string;
  options: ProductOption[];
}

export interface ProductVariant {
  id: string;
  title: string;
  quantityAvailable: number;
  availableForSale: boolean;
  currentlyNotInStock: boolean;
  price: Money;
  compareAtPrice?: Money | null;
  sku: string;
  selectedOptions: SelectedOption[];
  image?: ProductImage | null;
  product: VariantProduct;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  handle: string;
  productType: string;
  tags: string[];
  vendor: string;
  priceRange: PriceRange;
  compareAtPriceRange: PriceRange;
  images: ProductImage[];
  options: ProductOption[];
  requiresSellingPlan: boolean;
  onlineStoreUrl?: string | null;
  media: ProductMedia[];
  variants: ProductVariant[];
}

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

export type RootStackParamList = {
  CatalogScreen: undefined;
  ProductDetailScreen: { productId: string };
  CartScreen: undefined;
};
