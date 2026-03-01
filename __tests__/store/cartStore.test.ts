/**
 * cartStore.test.ts
 *
 * The store is a module-level Zustand singleton that hydrates from MMKV on
 * import (via loadItems()). The MMKV module is replaced by the in-memory mock
 * in __mocks__/react-native-mmkv.js automatically by Jest's moduleNameMapper.
 *
 * Strategy:
 *  - Reset store state to empty items in beforeEach via setState so each test
 *    starts clean without needing to re-require the module.
 *  - Access the underlying MMKV mock via require to assert persistence calls.
 */

import { useCartStore } from '../../src/store/cartStore';
import type { CartItem } from '../../src/types/cart';

// The MMKV mock used internally by src/storage/index.ts
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createMMKV } = require('react-native-mmkv') as {
  createMMKV: jest.Mock;
};
const mmkvMock = createMMKV() as {
  getString: jest.Mock;
  set: jest.Mock;
  remove: jest.Mock;
};

// ---------------------------------------------------------------------------
// Helpers
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

function getStore() {
  return useCartStore.getState();
}

beforeEach(() => {
  // Reset Zustand state to a clean empty cart
  useCartStore.setState({ items: [] });
  // Clear MMKV mock call history
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('cartStore — initial state', () => {
  it('starts with an empty items array', () => {
    expect(getStore().items).toEqual([]);
  });

  it('subtotal returns 0 when cart is empty', () => {
    expect(getStore().subtotal()).toBe(0);
  });

  it('totalItemCount returns 0 when cart is empty', () => {
    expect(getStore().totalItemCount()).toBe(0);
  });

  it('totalPrice returns 0 when cart is empty', () => {
    expect(getStore().totalPrice()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// addItem
// ---------------------------------------------------------------------------

describe('cartStore — addItem', () => {
  it('adds a new item to the cart', () => {
    getStore().addItem(makeItem());
    expect(getStore().items).toHaveLength(1);
  });

  it('stores the correct item data', () => {
    const item = makeItem({ variantId: 'v1', title: 'Hoodie', quantity: 2 });
    getStore().addItem(item);
    expect(getStore().items[0]).toMatchObject({ variantId: 'v1', title: 'Hoodie', quantity: 2 });
  });

  it('increases quantity when adding an item that already exists', () => {
    getStore().addItem(makeItem({ variantId: 'v1', quantity: 1 }));
    getStore().addItem(makeItem({ variantId: 'v1', quantity: 3 }));
    expect(getStore().items).toHaveLength(1);
    expect(getStore().items[0].quantity).toBe(4);
  });

  it('adds as a separate entry when variantId differs', () => {
    getStore().addItem(makeItem({ variantId: 'v1' }));
    getStore().addItem(makeItem({ variantId: 'v2' }));
    expect(getStore().items).toHaveLength(2);
  });

  it('persists items to storage after adding', () => {
    getStore().addItem(makeItem());
    expect(mmkvMock.set).toHaveBeenCalledWith('cart', expect.any(String));
  });

  it('persisted string is valid JSON containing the added item', () => {
    getStore().addItem(makeItem({ variantId: 'v42' }));
    const raw = mmkvMock.set.mock.calls.at(-1)?.[1] as string;
    const parsed = JSON.parse(raw) as CartItem[];
    expect(parsed[0].variantId).toBe('v42');
  });
});

// ---------------------------------------------------------------------------
// increaseQuantity
// ---------------------------------------------------------------------------

describe('cartStore — increaseQuantity', () => {
  it('increments the quantity of the matching variant by 1', () => {
    getStore().addItem(makeItem({ variantId: 'v1', quantity: 2 }));
    jest.clearAllMocks();
    getStore().increaseQuantity('v1');
    expect(getStore().items[0].quantity).toBe(3);
  });

  it('does not affect other items', () => {
    getStore().addItem(makeItem({ variantId: 'v1', quantity: 1 }));
    getStore().addItem(makeItem({ variantId: 'v2', quantity: 5 }));
    jest.clearAllMocks();
    getStore().increaseQuantity('v1');
    expect(getStore().items.find(i => i.variantId === 'v2')?.quantity).toBe(5);
  });

  it('persists after incrementing', () => {
    getStore().addItem(makeItem({ variantId: 'v1' }));
    jest.clearAllMocks();
    getStore().increaseQuantity('v1');
    expect(mmkvMock.set).toHaveBeenCalledWith('cart', expect.any(String));
  });
});

// ---------------------------------------------------------------------------
// decreaseQuantity
// ---------------------------------------------------------------------------

describe('cartStore — decreaseQuantity', () => {
  it('decrements the quantity of the matching variant by 1', () => {
    getStore().addItem(makeItem({ variantId: 'v1', quantity: 3 }));
    jest.clearAllMocks();
    getStore().decreaseQuantity('v1');
    expect(getStore().items[0].quantity).toBe(2);
  });

  it('does not affect other items', () => {
    getStore().addItem(makeItem({ variantId: 'v1', quantity: 3 }));
    getStore().addItem(makeItem({ variantId: 'v2', quantity: 2 }));
    jest.clearAllMocks();
    getStore().decreaseQuantity('v1');
    expect(getStore().items.find(i => i.variantId === 'v2')?.quantity).toBe(2);
  });

  it('persists after decrementing', () => {
    getStore().addItem(makeItem({ variantId: 'v1', quantity: 2 }));
    jest.clearAllMocks();
    getStore().decreaseQuantity('v1');
    expect(mmkvMock.set).toHaveBeenCalledWith('cart', expect.any(String));
  });
});

// ---------------------------------------------------------------------------
// removeItem
// ---------------------------------------------------------------------------

describe('cartStore — removeItem', () => {
  it('removes the item with the matching variantId', () => {
    getStore().addItem(makeItem({ variantId: 'v1' }));
    getStore().removeItem('v1');
    expect(getStore().items).toHaveLength(0);
  });

  it('only removes the matching item, leaving others intact', () => {
    getStore().addItem(makeItem({ variantId: 'v1' }));
    getStore().addItem(makeItem({ variantId: 'v2' }));
    getStore().removeItem('v1');
    expect(getStore().items).toHaveLength(1);
    expect(getStore().items[0].variantId).toBe('v2');
  });

  it('is a no-op for a variantId that does not exist', () => {
    getStore().addItem(makeItem({ variantId: 'v1' }));
    getStore().removeItem('does-not-exist');
    expect(getStore().items).toHaveLength(1);
  });

  it('persists after removing', () => {
    getStore().addItem(makeItem({ variantId: 'v1' }));
    jest.clearAllMocks();
    getStore().removeItem('v1');
    expect(mmkvMock.set).toHaveBeenCalledWith('cart', expect.any(String));
  });
});

// ---------------------------------------------------------------------------
// clearCart
// ---------------------------------------------------------------------------

describe('cartStore — clearCart', () => {
  it('empties the items array', () => {
    getStore().addItem(makeItem({ variantId: 'v1' }));
    getStore().addItem(makeItem({ variantId: 'v2' }));
    getStore().clearCart();
    expect(getStore().items).toEqual([]);
  });

  it('calls storage.delete (removes the cart key from MMKV)', () => {
    getStore().addItem(makeItem());
    jest.clearAllMocks();
    getStore().clearCart();
    expect(mmkvMock.remove).toHaveBeenCalledWith('cart');
  });

  it('is idempotent on an already-empty cart', () => {
    expect(() => getStore().clearCart()).not.toThrow();
    expect(getStore().items).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// subtotal
// ---------------------------------------------------------------------------

describe('cartStore — subtotal()', () => {
  it('returns 0 for an empty cart', () => {
    expect(getStore().subtotal()).toBe(0);
  });

  it('returns price × quantity for a single item', () => {
    getStore().addItem(makeItem({ price: { amount: '15.00', currencyCode: 'CAD' }, quantity: 3 }));
    expect(getStore().subtotal()).toBeCloseTo(45.0);
  });

  it('sums all items correctly', () => {
    getStore().addItem(makeItem({ variantId: 'v1', price: { amount: '10.00', currencyCode: 'CAD' }, quantity: 2 }));
    getStore().addItem(makeItem({ variantId: 'v2', price: { amount: '25.00', currencyCode: 'CAD' }, quantity: 1 }));
    expect(getStore().subtotal()).toBeCloseTo(45.0);
  });

  it('updates after adding an item', () => {
    getStore().addItem(makeItem({ price: { amount: '20.00', currencyCode: 'CAD' }, quantity: 1 }));
    expect(getStore().subtotal()).toBeCloseTo(20.0);
  });

  it('updates after removing an item', () => {
    getStore().addItem(makeItem({ variantId: 'v1', price: { amount: '10.00', currencyCode: 'CAD' }, quantity: 2 }));
    getStore().addItem(makeItem({ variantId: 'v2', price: { amount: '5.00', currencyCode: 'CAD' }, quantity: 1 }));
    getStore().removeItem('v2');
    expect(getStore().subtotal()).toBeCloseTo(20.0);
  });

  it('returns 0 after clearCart', () => {
    getStore().addItem(makeItem({ price: { amount: '50.00', currencyCode: 'CAD' }, quantity: 2 }));
    getStore().clearCart();
    expect(getStore().subtotal()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// totalItemCount
// ---------------------------------------------------------------------------

describe('cartStore — totalItemCount()', () => {
  it('returns 0 for an empty cart', () => {
    expect(getStore().totalItemCount()).toBe(0);
  });

  it('returns the quantity for a single item', () => {
    getStore().addItem(makeItem({ quantity: 4 }));
    expect(getStore().totalItemCount()).toBe(4);
  });

  it('sums quantities across all items', () => {
    getStore().addItem(makeItem({ variantId: 'v1', quantity: 3 }));
    getStore().addItem(makeItem({ variantId: 'v2', quantity: 2 }));
    expect(getStore().totalItemCount()).toBe(5);
  });

  it('updates after increaseQuantity', () => {
    getStore().addItem(makeItem({ quantity: 1 }));
    getStore().increaseQuantity('variant-1');
    expect(getStore().totalItemCount()).toBe(2);
  });

  it('updates after decreaseQuantity', () => {
    getStore().addItem(makeItem({ quantity: 3 }));
    getStore().decreaseQuantity('variant-1');
    expect(getStore().totalItemCount()).toBe(2);
  });

  it('returns 0 after clearCart', () => {
    getStore().addItem(makeItem({ quantity: 5 }));
    getStore().clearCart();
    expect(getStore().totalItemCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// totalPrice (alias for subtotal)
// ---------------------------------------------------------------------------

describe('cartStore — totalPrice()', () => {
  it('equals subtotal() for the same cart state', () => {
    getStore().addItem(makeItem({ price: { amount: '12.50', currencyCode: 'CAD' }, quantity: 2 }));
    expect(getStore().totalPrice()).toBe(getStore().subtotal());
  });

  it('returns 0 for an empty cart', () => {
    expect(getStore().totalPrice()).toBe(0);
  });
});
