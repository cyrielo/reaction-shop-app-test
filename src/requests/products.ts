import type { Product } from '../types/product';
import { ProductsResponseSchema, transformProduct } from '../helpers/product';
export const PRODUCTS_FEED_URL = 'https://gist.githubusercontent.com/agorovyi/40dcd166a38b4d1e9156ad66c87111b7/raw/36f1c815dd83ed8189e55e6e6619b5d7c7c4e7d6/testProducts.json';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(PRODUCTS_FEED_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }
  const json: unknown = await response.json();
  const parsed = ProductsResponseSchema.parse(json);
  return parsed.map(transformProduct);
}

export async function fetchProduct(id: string): Promise<Product> {
  const products = await fetchProducts();
  const product = products.find(p => p.id === id);
  if (product === undefined) {
    throw new Error(`Product not found: ${id}`);
  }
  return product;
}
