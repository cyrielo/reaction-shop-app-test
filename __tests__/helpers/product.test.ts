import { ProductsResponseSchema, transformProduct, RawProduct } from '../../src/helpers/product';

// ---------------------------------------------------------------------------
// Minimal valid raw product fixture
// ---------------------------------------------------------------------------

const makeRawProduct = (overrides: Partial<RawProduct> = {}): RawProduct => ({
  id: 'gid://shopify/Product/1',
  title: 'Test Product',
  description: 'A test product.',
  descriptionHtml: '<p>A test product.</p>',
  availableForSale: true,
  handle: 'test-product',
  productType: 'Apparel',
  tags: ['sale', 'new'],
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
    { id: 'img1', url: 'https://example.com/img.jpg', altText: 'Alt text', width: 800, height: 600 },
  ],
  options: [
    { id: 'opt1', name: 'Size', values: ['S', 'M', 'L'] },
  ],
  requiresSellingPlan: false,
  onlineStoreUrl: 'https://example.com/products/test-product',
  media: [
    {
      mediaContentType: 'IMAGE',
      image: { url: 'https://example.com/img.jpg', id: 'img1', altText: 'Alt text', width: 800, height: 600 },
    },
  ],
  variants: [
    {
      id: 'gid://shopify/ProductVariant/1',
      title: 'S / Red',
      quantityAvailable: 5,
      availableForSale: true,
      currentlyNotInStock: false,
      price: { amount: '10.00', currencyCode: 'CAD' },
      compareAtPrice: { amount: '15.00', currencyCode: 'CAD' },
      sku: 'SKU-S-RED',
      selectedOptions: [
        { name: 'Size', value: 'S' },
        { name: 'Color', value: 'Red' },
      ],
      image: { id: 'vimg1', url: 'https://example.com/variant.jpg', altText: null, width: 400, height: 400 },
      product: {
        id: 'gid://shopify/Product/1',
        handle: 'test-product',
        options: [{ id: 'opt1', name: 'Size', values: ['S', 'M', 'L'] }],
      },
    },
  ],
  ...overrides,
});

// ---------------------------------------------------------------------------
// ProductsResponseSchema — Zod validation
// ---------------------------------------------------------------------------

describe('ProductsResponseSchema', () => {
  describe('valid input', () => {
    it('parses an array with a single valid product', () => {
      const result = ProductsResponseSchema.safeParse([makeRawProduct()]);
      expect(result.success).toBe(true);
    });

    it('parses an empty array', () => {
      const result = ProductsResponseSchema.safeParse([]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('parses multiple products', () => {
      const result = ProductsResponseSchema.safeParse([
        makeRawProduct({ id: 'id1' }),
        makeRawProduct({ id: 'id2', title: 'Second' }),
      ]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
    });

    it('accepts a product with no images', () => {
      const result = ProductsResponseSchema.safeParse([makeRawProduct({ images: [] })]);
      expect(result.success).toBe(true);
    });

    it('accepts a product with no variants', () => {
      const result = ProductsResponseSchema.safeParse([makeRawProduct({ variants: [] })]);
      expect(result.success).toBe(true);
    });

    it('accepts a product with null onlineStoreUrl', () => {
      const result = ProductsResponseSchema.safeParse([makeRawProduct({ onlineStoreUrl: null })]);
      expect(result.success).toBe(true);
    });

    it('accepts a product where onlineStoreUrl is absent', () => {
      const raw = makeRawProduct();
      const { onlineStoreUrl: _omit, ...withoutUrl } = raw;
      const result = ProductsResponseSchema.safeParse([withoutUrl]);
      expect(result.success).toBe(true);
    });

    it('accepts a variant with null compareAtPrice', () => {
      const raw = makeRawProduct();
      raw.variants[0].compareAtPrice = null;
      const result = ProductsResponseSchema.safeParse([raw]);
      expect(result.success).toBe(true);
    });

    it('accepts a variant with null image', () => {
      const raw = makeRawProduct();
      raw.variants[0].image = null;
      const result = ProductsResponseSchema.safeParse([raw]);
      expect(result.success).toBe(true);
    });

    it('accepts an image with null altText', () => {
      const raw = makeRawProduct({
        images: [{ id: 'i1', url: 'https://example.com/a.jpg', altText: null, width: 100, height: 100 }],
      });
      const result = ProductsResponseSchema.safeParse([raw]);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid input', () => {
    it('fails when the top-level value is not an array', () => {
      expect(ProductsResponseSchema.safeParse(makeRawProduct()).success).toBe(false);
    });

    it('fails when id is missing', () => {
      const { id: _omit, ...noId } = makeRawProduct();
      expect(ProductsResponseSchema.safeParse([noId]).success).toBe(false);
    });

    it('fails when title is missing', () => {
      const { title: _omit, ...noTitle } = makeRawProduct();
      expect(ProductsResponseSchema.safeParse([noTitle]).success).toBe(false);
    });

    it('fails when availableForSale is a string instead of boolean', () => {
      expect(ProductsResponseSchema.safeParse([makeRawProduct({ availableForSale: 'yes' as unknown as boolean })]).success).toBe(false);
    });

    it('fails when priceRange is missing', () => {
      const { priceRange: _omit, ...noPriceRange } = makeRawProduct();
      expect(ProductsResponseSchema.safeParse([noPriceRange]).success).toBe(false);
    });

    it('fails when a variant is missing its sku', () => {
      const raw = makeRawProduct();
      const { sku: _omit, ...noSku } = raw.variants[0];
      raw.variants = [noSku as typeof raw.variants[0]];
      expect(ProductsResponseSchema.safeParse([raw]).success).toBe(false);
    });

    it('fails when tags is not an array', () => {
      expect(ProductsResponseSchema.safeParse([makeRawProduct({ tags: 'sale' as unknown as string[] })]).success).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// transformProduct — domain mapping
// ---------------------------------------------------------------------------

describe('transformProduct', () => {
  describe('scalar fields', () => {
    it('maps id', () => {
      expect(transformProduct(makeRawProduct()).id).toBe('gid://shopify/Product/1');
    });

    it('maps title', () => {
      expect(transformProduct(makeRawProduct()).title).toBe('Test Product');
    });

    it('maps description', () => {
      expect(transformProduct(makeRawProduct()).description).toBe('A test product.');
    });

    it('maps descriptionHtml', () => {
      expect(transformProduct(makeRawProduct()).descriptionHtml).toBe('<p>A test product.</p>');
    });

    it('maps availableForSale', () => {
      expect(transformProduct(makeRawProduct({ availableForSale: false })).availableForSale).toBe(false);
    });

    it('maps handle', () => {
      expect(transformProduct(makeRawProduct()).handle).toBe('test-product');
    });

    it('maps productType', () => {
      expect(transformProduct(makeRawProduct()).productType).toBe('Apparel');
    });

    it('maps tags', () => {
      expect(transformProduct(makeRawProduct()).tags).toEqual(['sale', 'new']);
    });

    it('maps vendor', () => {
      expect(transformProduct(makeRawProduct()).vendor).toBe('TestVendor');
    });

    it('maps requiresSellingPlan', () => {
      expect(transformProduct(makeRawProduct({ requiresSellingPlan: true })).requiresSellingPlan).toBe(true);
    });

    it('maps onlineStoreUrl when present', () => {
      expect(transformProduct(makeRawProduct()).onlineStoreUrl).toBe('https://example.com/products/test-product');
    });

    it('maps onlineStoreUrl to null when null', () => {
      expect(transformProduct(makeRawProduct({ onlineStoreUrl: null })).onlineStoreUrl).toBeNull();
    });

    it('maps onlineStoreUrl to null when undefined', () => {
      const raw = makeRawProduct();
      delete (raw as Partial<RawProduct>).onlineStoreUrl;
      expect(transformProduct(raw).onlineStoreUrl).toBeNull();
    });
  });

  describe('priceRange', () => {
    it('maps minVariantPrice amount', () => {
      expect(transformProduct(makeRawProduct()).priceRange.minVariantPrice.amount).toBe('10.00');
    });

    it('maps minVariantPrice currencyCode', () => {
      expect(transformProduct(makeRawProduct()).priceRange.minVariantPrice.currencyCode).toBe('CAD');
    });

    it('maps maxVariantPrice amount', () => {
      expect(transformProduct(makeRawProduct()).priceRange.maxVariantPrice.amount).toBe('20.00');
    });
  });

  describe('compareAtPriceRange', () => {
    it('maps minVariantPrice', () => {
      expect(transformProduct(makeRawProduct()).compareAtPriceRange.minVariantPrice.amount).toBe('15.00');
    });

    it('maps maxVariantPrice', () => {
      expect(transformProduct(makeRawProduct()).compareAtPriceRange.maxVariantPrice.amount).toBe('25.00');
    });
  });

  describe('images', () => {
    it('maps image count', () => {
      expect(transformProduct(makeRawProduct()).images).toHaveLength(1);
    });

    it('maps image id', () => {
      expect(transformProduct(makeRawProduct()).images[0].id).toBe('img1');
    });

    it('maps image url', () => {
      expect(transformProduct(makeRawProduct()).images[0].url).toBe('https://example.com/img.jpg');
    });

    it('maps image altText', () => {
      expect(transformProduct(makeRawProduct()).images[0].altText).toBe('Alt text');
    });

    it('maps image altText to null when absent', () => {
      const raw = makeRawProduct({
        images: [{ id: 'i1', url: 'https://example.com/a.jpg', width: 100, height: 100 }],
      });
      expect(transformProduct(raw).images[0].altText).toBeNull();
    });

    it('returns empty images array when source has none', () => {
      expect(transformProduct(makeRawProduct({ images: [] })).images).toEqual([]);
    });
  });

  describe('options', () => {
    it('maps option id', () => {
      expect(transformProduct(makeRawProduct()).options[0].id).toBe('opt1');
    });

    it('maps option name', () => {
      expect(transformProduct(makeRawProduct()).options[0].name).toBe('Size');
    });

    it('maps option values', () => {
      expect(transformProduct(makeRawProduct()).options[0].values).toEqual(['S', 'M', 'L']);
    });
  });

  describe('media', () => {
    it('maps media count', () => {
      expect(transformProduct(makeRawProduct()).media).toHaveLength(1);
    });

    it('maps mediaContentType', () => {
      expect(transformProduct(makeRawProduct()).media[0].mediaContentType).toBe('IMAGE');
    });

    it('maps media image url', () => {
      expect(transformProduct(makeRawProduct()).media[0].image.url).toBe('https://example.com/img.jpg');
    });
  });

  describe('variants', () => {
    it('maps variant count', () => {
      expect(transformProduct(makeRawProduct()).variants).toHaveLength(1);
    });

    it('maps variant id', () => {
      expect(transformProduct(makeRawProduct()).variants[0].id).toBe('gid://shopify/ProductVariant/1');
    });

    it('maps variant title', () => {
      expect(transformProduct(makeRawProduct()).variants[0].title).toBe('S / Red');
    });

    it('maps variant sku', () => {
      expect(transformProduct(makeRawProduct()).variants[0].sku).toBe('SKU-S-RED');
    });

    it('maps variant price', () => {
      expect(transformProduct(makeRawProduct()).variants[0].price).toEqual({ amount: '10.00', currencyCode: 'CAD' });
    });

    it('maps variant compareAtPrice when present', () => {
      expect(transformProduct(makeRawProduct()).variants[0].compareAtPrice).toEqual({ amount: '15.00', currencyCode: 'CAD' });
    });

    it('maps variant compareAtPrice to null when null', () => {
      const raw = makeRawProduct();
      raw.variants[0].compareAtPrice = null;
      expect(transformProduct(raw).variants[0].compareAtPrice).toBeNull();
    });

    it('maps variant selectedOptions', () => {
      expect(transformProduct(makeRawProduct()).variants[0].selectedOptions).toEqual([
        { name: 'Size', value: 'S' },
        { name: 'Color', value: 'Red' },
      ]);
    });

    it('maps variant image when present', () => {
      const image = transformProduct(makeRawProduct()).variants[0].image;
      expect(image).not.toBeNull();
      expect(image?.url).toBe('https://example.com/variant.jpg');
    });

    it('maps variant image to null when null', () => {
      const raw = makeRawProduct();
      raw.variants[0].image = null;
      expect(transformProduct(raw).variants[0].image).toBeNull();
    });

    it('maps variant product reference id', () => {
      expect(transformProduct(makeRawProduct()).variants[0].product.id).toBe('gid://shopify/Product/1');
    });

    it('maps variant product reference handle', () => {
      expect(transformProduct(makeRawProduct()).variants[0].product.handle).toBe('test-product');
    });

    it('maps variant product reference options', () => {
      expect(transformProduct(makeRawProduct()).variants[0].product.options).toEqual([
        { id: 'opt1', name: 'Size', values: ['S', 'M', 'L'] },
      ]);
    });

    it('maps variant quantityAvailable', () => {
      expect(transformProduct(makeRawProduct()).variants[0].quantityAvailable).toBe(5);
    });

    it('maps variant availableForSale', () => {
      expect(transformProduct(makeRawProduct()).variants[0].availableForSale).toBe(true);
    });

    it('maps variant currentlyNotInStock', () => {
      expect(transformProduct(makeRawProduct()).variants[0].currentlyNotInStock).toBe(false);
    });

    it('returns empty variants array when source has none', () => {
      expect(transformProduct(makeRawProduct({ variants: [] })).variants).toEqual([]);
    });
  });
});
