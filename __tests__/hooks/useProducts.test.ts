import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import useProducts, { PRODUCTS_QUERY_KEY } from '../../src/hooks/useProducts';
import type { Product } from '../../src/types';

jest.mock('../../src/requests/products', () => ({
  fetchProducts: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fetchProducts } = require('../../src/requests/products') as {
  fetchProducts: jest.Mock;
};

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'gid://shopify/Product/1',
  title: 'Test Product',
  description: 'A description.',
  descriptionHtml: '<p>A description.</p>',
  availableForSale: true,
  handle: 'test-product',
  productType: 'Apparel',
  tags: [],
  vendor: 'TestVendor',
  priceRange: {
    minVariantPrice: { amount: '10.00', currencyCode: 'CAD' },
    maxVariantPrice: { amount: '10.00', currencyCode: 'CAD' },
  },
  compareAtPriceRange: {
    minVariantPrice: { amount: '15.00', currencyCode: 'CAD' },
    maxVariantPrice: { amount: '15.00', currencyCode: 'CAD' },
  },
  images: [],
  options: [],
  media: [],
  variants: [],
  requiresSellingPlan: false,
  onlineStoreUrl: null,
  ...overrides,
});

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useProducts', () => {
  it('starts in loading state', () => {
    fetchProducts.mockReturnValue(new Promise(() => {})); // never resolves
    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(queryClient),
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns products on success', async () => {
    const products = [makeProduct(), makeProduct({ id: 'id2', title: 'Second' })];
    fetchProducts.mockResolvedValue(products);
    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(products);
    expect(result.current.data).toHaveLength(2);
  });

  it('sets isError when fetchProducts rejects', async () => {
    fetchProducts.mockRejectedValue(new Error('network failure'));
    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('network failure');
    expect(result.current.data).toBeUndefined();
  });

  it('uses the correct query key', async () => {
    fetchProducts.mockResolvedValue([]);
    const queryClient = makeQueryClient();
    renderHook(() => useProducts(), { wrapper: makeWrapper(queryClient) });

    await waitFor(() =>
      expect(queryClient.getQueryState(PRODUCTS_QUERY_KEY as unknown as string[])?.status).toBe('success'),
    );

    expect(fetchProducts).toHaveBeenCalledTimes(1);
  });

  it('returns empty array when fetch resolves with no products', async () => {
    fetchProducts.mockResolvedValue([]);
    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});
