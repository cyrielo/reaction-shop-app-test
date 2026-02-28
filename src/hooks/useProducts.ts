import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { fetchProducts } from '../requests/products';
import type { Product } from '../types';

export const PRODUCTS_QUERY_KEY = ['products'] as const;

const useProducts = (): UseQueryResult<Product[], Error> => {
  return useQuery<Product[], Error>({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: fetchProducts,
  });
};

export default useProducts;
