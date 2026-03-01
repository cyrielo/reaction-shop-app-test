import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '../../../src/features/catalog/ProductCard';
import type { Product } from '../../../src/types';

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const money = (amount: string) => ({ amount, currencyCode: 'CAD' });

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'gid://shopify/Product/1',
    title: 'Test Shirt',
    description: 'A great shirt.',
    descriptionHtml: '<p>A great shirt.</p>',
    availableForSale: true,
    handle: 'test-shirt',
    productType: 'Apparel',
    tags: [],
    vendor: 'TestCo',
    priceRange: {
      minVariantPrice: money('29.99'),
      maxVariantPrice: money('29.99'),
    },
    compareAtPriceRange: {
      minVariantPrice: money('49.99'),
      maxVariantPrice: money('49.99'),
    },
    images: [
      { id: 'img1', url: 'https://example.com/shirt.jpg', altText: 'A shirt', width: 800, height: 800 },
    ],
    options: [],
    media: [],
    variants: [],
    requiresSellingPlan: false,
    onlineStoreUrl: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('ProductCard — rendering', () => {
  it('renders the product title', () => {
    const { getByText } = render(<ProductCard product={makeProduct()} onPress={jest.fn()} />);
    expect(getByText('Test Shirt')).toBeTruthy();
  });

  it('renders "In Stock" badge when product is available', () => {
    const { getByText } = render(<ProductCard product={makeProduct({ availableForSale: true })} onPress={jest.fn()} />);
    expect(getByText('In Stock')).toBeTruthy();
  });

  it('renders "Out of Stock" badge when product is unavailable', () => {
    const { getByText } = render(<ProductCard product={makeProduct({ availableForSale: false })} onPress={jest.fn()} />);
    expect(getByText('Out of Stock')).toBeTruthy();
  });

  it('renders the formatted price', () => {
    const { getByText } = render(<ProductCard product={makeProduct()} onPress={jest.fn()} />);
    expect(getByText('CA$29.99')).toBeTruthy();
  });

  it('renders the compareAt price when there is a discount', () => {
    const { getByText } = render(<ProductCard product={makeProduct()} onPress={jest.fn()} />);
    expect(getByText('CA$49.99')).toBeTruthy();
  });

  it('does not render compareAt price when price equals compareAtPrice', () => {
    const product = makeProduct({
      compareAtPriceRange: {
        minVariantPrice: money('29.99'),
        maxVariantPrice: money('29.99'),
      },
    });
    const { getAllByText } = render(<ProductCard product={product} onPress={jest.fn()} />);
    // Only one price element — no strikethrough compareAt
    expect(getAllByText('CA$29.99')).toHaveLength(1);
  });

  it('renders an Image when the product has images', () => {
    const { UNSAFE_getByType } = render(<ProductCard product={makeProduct()} onPress={jest.fn()} />);
    const { Image } = require('react-native');
    expect(UNSAFE_getByType(Image)).toBeTruthy();
  });

  it('renders a placeholder View when the product has no images', () => {
    const product = makeProduct({ images: [] });
    const { UNSAFE_queryAllByType } = render(<ProductCard product={product} onPress={jest.fn()} />);
    const { Image } = require('react-native');
    expect(UNSAFE_queryAllByType(Image)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('ProductCard — accessibility', () => {
  it('has accessibilityRole="button"', () => {
    const { getByRole } = render(<ProductCard product={makeProduct()} onPress={jest.fn()} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('accessibilityLabel includes product title and "available" when in stock', () => {
    const { getByRole } = render(<ProductCard product={makeProduct({ availableForSale: true })} onPress={jest.fn()} />);
    expect(getByRole('button').props.accessibilityLabel).toBe('Test Shirt, available');
  });

  it('accessibilityLabel includes "unavailable" when out of stock', () => {
    const { getByRole } = render(<ProductCard product={makeProduct({ availableForSale: false })} onPress={jest.fn()} />);
    expect(getByRole('button').props.accessibilityLabel).toBe('Test Shirt, unavailable');
  });

  it('has accessibilityHint="Opens product details"', () => {
    const { getByRole } = render(<ProductCard product={makeProduct()} onPress={jest.fn()} />);
    expect(getByRole('button').props.accessibilityHint).toBe('Opens product details');
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

describe('ProductCard — interactions', () => {
  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<ProductCard product={makeProduct()} onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress on its own — only on explicit press', () => {
    const onPress = jest.fn();
    render(<ProductCard product={makeProduct()} onPress={onPress} />);
    expect(onPress).not.toHaveBeenCalled();
  });
});
