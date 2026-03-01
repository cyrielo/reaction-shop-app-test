/**
 * queryClient.ts has module-level side effects:
 *   1. restoreCache() runs on import — reads persisted state from storage
 *   2. queryClient.getQueryCache().subscribe() persists on every cache change
 *
 * Strategy: mock the storage module at the top level, then swap the mock
 * implementation per-test via mockReturnValue / mockImplementation.
 * jest.isolateModules() gives a fresh queryClient instance for each test so
 * the module-level side effects (restoreCache + subscribe) fire cleanly.
 */

import { QueryClient, dehydrate } from '@tanstack/query-core';

// --- top-level mocks (hoisted by Babel's jest-hoist transform) ---
jest.mock('../../src/storage', () => ({
  StorageKey: { CART: 'cart', PRODUCT_CACHE: 'product_cache' },
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

// Typed handle to the mocked storage so we can configure it per-test
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockStorage = require('../../src/storage').storage as {
  get: jest.Mock;
  set: jest.Mock;
  delete: jest.Mock;
};

// Track every QueryClient created per test so we can destroy them in afterEach,
// which cancels any pending GC timers and closes the open handles Jest detects.
const createdClients: QueryClient[] = [];

// Helper: load a fresh isolated queryClient module
function loadFreshQueryClient(): { queryClient: QueryClient } {
  let mod!: { queryClient: QueryClient };
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('../../src/requests/queryClient') as { queryClient: QueryClient };
  });
  createdClients.push(mod.queryClient);
  return mod;
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: storage returns null (no prior cache)
  mockStorage.get.mockReturnValue(null);
});

afterEach(() => {
  // Clear all queries from every client loaded in this test to cancel pending GC timers
  createdClients.splice(0).forEach(client => client.clear());
});

// ---------------------------------------------------------------------------

describe('queryClient — default options', () => {
  it('sets staleTime to 5 minutes', () => {
    const { queryClient } = loadFreshQueryClient();
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000);
  });

  it('sets gcTime to 24 hours', () => {
    const { queryClient } = loadFreshQueryClient();
    expect(queryClient.getDefaultOptions().queries?.gcTime).toBe(24 * 60 * 60 * 1000);
  });

  it('sets retry to 2', () => {
    const { queryClient } = loadFreshQueryClient();
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(2);
  });
});

// ---------------------------------------------------------------------------

describe('queryClient — restoreCache (on import)', () => {
  it('reads from storage with the PRODUCT_CACHE key on startup', () => {
    loadFreshQueryClient();
    expect(mockStorage.get).toHaveBeenCalledWith('product_cache');
  });

  it('does not throw when storage returns null (no prior cache)', () => {
    mockStorage.get.mockReturnValue(null);
    expect(() => loadFreshQueryClient()).not.toThrow();
  });

  it('hydrates the cache when a valid dehydrated state is stored', async () => {
    // Build a dehydrated state to put in storage
    const sourceClient = new QueryClient();
    await sourceClient.prefetchQuery({
      queryKey: ['products'],
      queryFn: async () => [{ id: '1', title: 'Cached' }],
    });
    const dehydratedState = dehydrate(sourceClient);

    mockStorage.get.mockReturnValue(dehydratedState);

    const { queryClient } = loadFreshQueryClient();

    const cached = queryClient.getQueryData<Array<{ id: string }>>(['products']);
    expect(cached).toBeDefined();
    expect(cached?.[0].id).toBe('1');
  });
});

// ---------------------------------------------------------------------------

describe('queryClient — persistCache (on cache change)', () => {
  it('calls storage.set with PRODUCT_CACHE after a query is seeded', async () => {
    const { queryClient } = loadFreshQueryClient();

    await queryClient.prefetchQuery({
      queryKey: ['catalog'],
      queryFn: async () => [{ id: 'p1' }],
    });

    expect(mockStorage.set).toHaveBeenCalledWith(
      'product_cache',
      expect.objectContaining({ queries: expect.any(Array) }),
    );
  });

  it('persisted state includes the query key that was added', async () => {
    const { queryClient } = loadFreshQueryClient();

    await queryClient.prefetchQuery({
      queryKey: ['catalog', 'list'],
      queryFn: async () => [{ id: 'p1' }],
    });

    const calls = (mockStorage.set as jest.Mock).mock.calls;
    const lastPersistedState = calls.at(-1)?.[1] as {
      queries: Array<{ queryKey: unknown[] }>;
    };
    const queryKeys = lastPersistedState.queries.map(q => q.queryKey);
    expect(queryKeys).toContainEqual(['catalog', 'list']);
  });

  it('persists multiple times as the cache evolves', async () => {
    const { queryClient } = loadFreshQueryClient();

    // clear set calls accumulated by restoreCache path
    mockStorage.set.mockClear();

    await queryClient.prefetchQuery({
      queryKey: ['q1'],
      queryFn: async () => 'a',
    });
    await queryClient.prefetchQuery({
      queryKey: ['q2'],
      queryFn: async () => 'b',
    });

    expect(mockStorage.set.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
