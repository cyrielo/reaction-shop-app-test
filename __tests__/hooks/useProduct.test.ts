import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import useProduct, { productQueryKey } from '../../src/hooks/useProduct';
import type { Product } from '../../src/types';

jest.mock('../../src/requests/products', () => ({
  fetchProduct: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fetchProduct } = require('../../src/requests/products') as {
  fetchProduct: jest.Mock;
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

describe('productQueryKey', () => {
  it('returns a tuple of ["product", id]', () => {
    expect(productQueryKey('abc')).toEqual(['product', 'abc']);
  });

  it('is unique per id', () => {
    expect(productQueryKey('1')).not.toEqual(productQueryKey('2'));
  });
});

describe('useProduct', () => {
  it('starts in loading state when id is non-empty', () => {
    fetchProduct.mockReturnValue(new Promise(() => {})); // never resolves
    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useProduct('id-1'), {
      wrapper: makeWrapper(queryClient),
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns the product on success', async () => {
    const product = makeProduct({ id: 'id-1', title: 'Fetched Product' });
    fetchProduct.mockResolvedValue(product);
    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useProduct('id-1'), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(product);
    expect(fetchProduct).toHaveBeenCalledWith('id-1');
  });

  it('sets isError when fetchProduct rejects', async () => {
    fetchProduct.mockRejectedValue(new Error('Product not found: id-bad'));
    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useProduct('id-bad'), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Product not found: id-bad');
    expect(result.current.data).toBeUndefined();
  });

  it('does not fetch when id is empty (enabled: false)', () => {
    const queryClient = makeQueryClient();
    const { result } = renderHook(() => useProduct(''), {
      wrapper: makeWrapper(queryClient),
    });

    // Not loading — query is disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(fetchProduct).not.toHaveBeenCalled();
  });

  it('uses the correct query key for the given id', async () => {
    fetchProduct.mockResolvedValue(makeProduct());
    const queryClient = makeQueryClient();
    renderHook(() => useProduct('prod-42'), { wrapper: makeWrapper(queryClient) });

    await waitFor(() =>
      expect(queryClient.getQueryState(['product', 'prod-42'])?.status).toBe('success'),
    );
  });

  it('re-fetches when id changes', async () => {
    const productA = makeProduct({ id: 'a', title: 'Product A' });
    const productB = makeProduct({ id: 'b', title: 'Product B' });
    fetchProduct
      .mockResolvedValueOnce(productA)
      .mockResolvedValueOnce(productB);

    const queryClient = makeQueryClient();
    let id = 'a';
    const { result, rerender } = renderHook(() => useProduct(id), {
      wrapper: makeWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.data?.id).toBe('a'));

    id = 'b';
    rerender({});

    await waitFor(() => expect(result.current.data?.id).toBe('b'));
    expect(fetchProduct).toHaveBeenCalledTimes(2);
  });
});
