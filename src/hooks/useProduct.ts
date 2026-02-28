import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { fetchProduct } from '../requests/products';
import type { Product } from '../types';

export const productQueryKey = (id: string): readonly [string, string] =>
  ['product', id] as const;

const useProduct = (id: string): UseQueryResult<Product, Error> => {
  return useQuery<Product, Error>({
    queryKey: productQueryKey(id),
    queryFn: () => fetchProduct(id),
    enabled: id.length > 0,
  });
};

export default useProduct;
