import { fetchProducts, fetchProduct, PRODUCTS_FEED_URL } from '../../src/requests/products';
import type { RawProduct } from '../../src/helpers/product';

// Minimal raw product fixture that satisfies the Zod schema
const makeRawProduct = (overrides: Partial<RawProduct> = {}): RawProduct => ({
  id: 'gid://shopify/Product/1',
  title: 'Test Product',
  description: 'A test product.',
  descriptionHtml: '<p>A test product.</p>',
  availableForSale: true,
  handle: 'test-product',
  productType: 'Apparel',
  tags: ['tag1'],
  vendor: 'TestVendor',
  priceRange: {
    minVariantPrice: { amount: '10.00', currencyCode: 'CAD' },
    maxVariantPrice: { amount: '20.00', currencyCode: 'CAD' },
  },
  compareAtPriceRange: {
    minVariantPrice: { amount: '15.00', currencyCode: 'CAD' },
    maxVariantPrice: { amount: '25.00', currencyCode: 'CAD' },
  },
  images: [
    { id: 'img1', url: 'https://example.com/img.jpg', altText: 'Test', width: 800, height: 600 },
  ],
  options: [
    { id: 'opt1', name: 'Size', values: ['S', 'M', 'L'] },
  ],
  requiresSellingPlan: false,
  onlineStoreUrl: null,
  media: [
    {
      mediaContentType: 'IMAGE',
      image: { url: 'https://example.com/img.jpg', id: 'img1', altText: 'Test', width: 800, height: 600 },
    },
  ],
  variants: [
    {
      id: 'gid://shopify/ProductVariant/1',
      title: 'S',
      quantityAvailable: 5,
      availableForSale: true,
      currentlyNotInStock: false,
      price: { amount: '10.00', currencyCode: 'CAD' },
      compareAtPrice: null,
      sku: 'SKU-S',
      selectedOptions: [{ name: 'Size', value: 'S' }],
      image: null,
      product: {
        id: 'gid://shopify/Product/1',
        handle: 'test-product',
        options: [{ id: 'opt1', name: 'Size', values: ['S', 'M', 'L'] }],
      },
    },
  ],
  ...overrides,
});

// Spy on globalThis.fetch — avoids `global.fetch =` assignment which needs
// the Node global type augmentation and causes ts(2304).
let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  fetchSpy = jest.spyOn(globalThis, 'fetch');
});

afterEach(() => {
  fetchSpy.mockRestore();
});

// Helper: mock a successful JSON response
function mockFetchOk(body: unknown): void {
  fetchSpy.mockResolvedValue({
    ok: true,
    json: async () => body,
  } as Response);
}

// Helper: mock a non-ok response
function mockFetchFail(status: number): void {
  fetchSpy.mockResolvedValue({ ok: false, status } as Response);
}

describe('fetchProducts', () => {
  it('fetches from PRODUCTS_FEED_URL', async () => {
    mockFetchOk([makeRawProduct()]);
    await fetchProducts();
    expect(fetchSpy).toHaveBeenCalledWith(PRODUCTS_FEED_URL);
  });

  it('returns transformed products on success', async () => {
    const raw = makeRawProduct();
    mockFetchOk([raw]);

    const products = await fetchProducts();

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe(raw.id);
    expect(products[0].title).toBe(raw.title);
  });

  it('maps all domain fields correctly', async () => {
    mockFetchOk([makeRawProduct()]);

    const [product] = await fetchProducts();

    expect(product.priceRange.minVariantPrice.amount).toBe('10.00');
    expect(product.priceRange.minVariantPrice.currencyCode).toBe('CAD');
    expect(product.variants).toHaveLength(1);
    expect(product.variants[0].sku).toBe('SKU-S');
    expect(product.images).toHaveLength(1);
    expect(product.options[0].values).toEqual(['S', 'M', 'L']);
  });

  it('returns multiple products', async () => {
    mockFetchOk([
      makeRawProduct({ id: 'id1', title: 'First' }),
      makeRawProduct({ id: 'id2', title: 'Second' }),
    ]);

    const products = await fetchProducts();

    expect(products).toHaveLength(2);
    expect(products[1].id).toBe('id2');
  });

  it('throws when response is not ok (500)', async () => {
    mockFetchFail(500);
    await expect(fetchProducts()).rejects.toThrow('Failed to fetch products: 500');
  });

  it('throws when response is not ok (404)', async () => {
    mockFetchFail(404);
    await expect(fetchProducts()).rejects.toThrow('Failed to fetch products: 404');
  });

  it('throws when fetch itself rejects (network error)', async () => {
    fetchSpy.mockRejectedValue(new Error('Network failure'));
    await expect(fetchProducts()).rejects.toThrow('Network failure');
  });

  it('throws when response body fails Zod validation', async () => {
    mockFetchOk([{ invalid: true }]);
    await expect(fetchProducts()).rejects.toThrow();
  });

  it('returns empty array when response is an empty array', async () => {
    mockFetchOk([]);
    const products = await fetchProducts();
    expect(products).toEqual([]);
  });
});

describe('fetchProduct', () => {
  it('returns the matching product by id', async () => {
    const target = makeRawProduct({ id: 'gid://shopify/Product/42', title: 'Found It' });
    mockFetchOk([makeRawProduct(), target]);

    const product = await fetchProduct('gid://shopify/Product/42');

    expect(product.id).toBe('gid://shopify/Product/42');
    expect(product.title).toBe('Found It');
  });

  it('throws when no product matches the id', async () => {
    mockFetchOk([makeRawProduct()]);
    await expect(fetchProduct('does-not-exist')).rejects.toThrow(
      'Product not found: does-not-exist',
    );
  });

  it('throws when fetchProducts throws (network error)', async () => {
    fetchSpy.mockRejectedValue(new Error('offline'));
    await expect(fetchProduct('any')).rejects.toThrow('offline');
  });

  it('throws when fetchProducts throws (non-ok response)', async () => {
    mockFetchFail(503);
    await expect(fetchProduct('any')).rejects.toThrow('Failed to fetch products: 503');
  });
});
