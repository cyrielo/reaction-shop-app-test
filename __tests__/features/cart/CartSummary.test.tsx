import React from 'react';
import { render } from '@testing-library/react-native';
import CartSummary from '../../../src/features/cart/CartSummary';
import type { CartItem } from '../../../src/types/cart';

// Mock the entire cartStore module so tests control what the hook returns
jest.mock('../../../src/store/cartStore');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useCartStore } = require('../../../src/store/cartStore') as {
  useCartStore: jest.Mock;
};

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: 'variant-1',
    productId: 'product-1',
    title: 'Test Shirt',
    variantTitle: 'S / Red',
    price: { amount: '29.99', currencyCode: 'CAD' },
    quantity: 1,
    image: null,
    ...overrides,
  };
}

/**
 * Configure what useCartStore returns for a given set of items.
 * CartSummary calls useCartStore three separate times (subtotal, totalItemCount, items),
 * so we implement the selector-based mock used by Zustand.
 */
function mockStore(items: CartItem[]): void {
  const subtotalValue = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useCartStore.mockImplementation(
    (selector: (state: { subtotal: () => number; totalItemCount: () => number; items: CartItem[] }) => unknown) =>
      selector({
        subtotal: () => subtotalValue,
        totalItemCount: () => itemCount,
        items,
      }),
  );
}

beforeEach(() => {
  mockStore([]);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('CartSummary — rendering', () => {
  it('renders without crashing when cart is empty', () => {
    expect(() => render(<CartSummary />)).not.toThrow();
  });

  it('renders "Cart Summary" heading', () => {
    const { getByText } = render(<CartSummary />);
    expect(getByText('Cart Summary')).toBeTruthy();
  });

  it('shows "0 items" when cart is empty', () => {
    const { getByText } = render(<CartSummary />);
    expect(getByText('0 items')).toBeTruthy();
  });

  it('shows "1 item" (singular) for a single-item quantity', () => {
    mockStore([makeItem({ quantity: 1 })]);
    const { getByText } = render(<CartSummary />);
    expect(getByText('1 item')).toBeTruthy();
  });

  it('shows "N items" (plural) for multiple items', () => {
    mockStore([makeItem({ quantity: 2 }), makeItem({ variantId: 'v2', quantity: 1 })]);
    const { getByText } = render(<CartSummary />);
    expect(getByText('3 items')).toBeTruthy();
  });

  it('renders the formatted subtotal price', () => {
    mockStore([makeItem({ quantity: 1 })]);
    const { getAllByText } = render(<CartSummary />);
    // CA$29.99 appears in both the item count row and the sub-total/total rows
    expect(getAllByText('CA$29.99').length).toBeGreaterThanOrEqual(1);
  });

  it('renders CA$0.00 when cart is empty', () => {
    mockStore([]);
    const { getAllByText } = render(<CartSummary />);
    expect(getAllByText('CA$0.00').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Sub-total" label', () => {
    const { getByText } = render(<CartSummary />);
    expect(getByText('Sub-total')).toBeTruthy();
  });

  it('shows "Total" label', () => {
    const { getByText } = render(<CartSummary />);
    expect(getByText('Total')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Computed values
// ---------------------------------------------------------------------------

describe('CartSummary — computed values', () => {
  it('calculates subtotal correctly for a single item', () => {
    mockStore([makeItem({ price: { amount: '15.00', currencyCode: 'CAD' }, quantity: 3 })]);
    const { getAllByText } = render(<CartSummary />);
    expect(getAllByText('CA$45.00').length).toBeGreaterThanOrEqual(1);
  });

  it('calculates subtotal correctly for multiple items', () => {
    mockStore([
      makeItem({ variantId: 'v1', price: { amount: '10.00', currencyCode: 'CAD' }, quantity: 2 }),
      makeItem({ variantId: 'v2', price: { amount: '25.00', currencyCode: 'CAD' }, quantity: 1 }),
    ]);
    const { getAllByText } = render(<CartSummary />);
    expect(getAllByText('CA$45.00').length).toBeGreaterThanOrEqual(1);
  });

  it('updates displayed price when store changes', () => {
    mockStore([makeItem({ price: { amount: '10.00', currencyCode: 'CAD' }, quantity: 1 })]);
    const { getAllByText, rerender } = render(<CartSummary />);
    expect(getAllByText('CA$10.00').length).toBeGreaterThanOrEqual(1);

    mockStore([makeItem({ price: { amount: '50.00', currencyCode: 'CAD' }, quantity: 1 })]);
    rerender(<CartSummary />);
    expect(getAllByText('CA$50.00').length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('CartSummary — accessibility', () => {
  it('item count row has composite accessibilityLabel', () => {
    mockStore([makeItem({ quantity: 2 })]);
    const { getByLabelText } = render(<CartSummary />);
    expect(getByLabelText('2 items: CA$59.98')).toBeTruthy();
  });

  it('sub-total row has composite accessibilityLabel', () => {
    mockStore([makeItem({ quantity: 1 })]);
    const { getByLabelText } = render(<CartSummary />);
    expect(getByLabelText('Sub-total: CA$29.99')).toBeTruthy();
  });

  it('total row has composite accessibilityLabel', () => {
    mockStore([makeItem({ quantity: 1 })]);
    const { getByLabelText } = render(<CartSummary />);
    expect(getByLabelText('Total: CA$29.99')).toBeTruthy();
  });

  it('uses singular "item" in accessibilityLabel for quantity 1', () => {
    mockStore([makeItem({ quantity: 1 })]);
    const { getByLabelText } = render(<CartSummary />);
    expect(getByLabelText('1 item: CA$29.99')).toBeTruthy();
  });
});
