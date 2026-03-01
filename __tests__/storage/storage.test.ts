import { createStorage } from '../../src/storage';
import type { Storage } from '../../src/storage';
import type { MMKV } from 'react-native-mmkv';

// Build a minimal in-memory MMKV double for each test suite
function makeMockMMKV(): jest.Mocked<Pick<MMKV, 'getString' | 'set' | 'remove'>> & { _store: Map<string, string> } {
  const _store = new Map<string, string>();
  return {
    _store,
    getString: jest.fn((key: string) => _store.get(key)),
    set: jest.fn((key: string, value: boolean | string | number | ArrayBuffer) => { _store.set(key, String(value)); }),
    remove: jest.fn((key: string): boolean => _store.delete(key)),
  };
}

describe('createStorage', () => {
  let mock: ReturnType<typeof makeMockMMKV>;
  let store: Storage;

  beforeEach(() => {
    mock = makeMockMMKV();
    store = createStorage(mock as unknown as MMKV);
  });

  describe('get', () => {
    it('returns null when key does not exist', () => {
      expect(store.get('missing')).toBeNull();
    });

    it('deserialises a stored JSON value', () => {
      mock._store.set('key', JSON.stringify({ foo: 'bar' }));
      expect(store.get<{ foo: string }>('key')).toEqual({ foo: 'bar' });
    });

    it('returns null when stored value is invalid JSON', () => {
      mock._store.set('key', 'not-json{{');
      expect(store.get('key')).toBeNull();
    });

    it('handles primitive types: number', () => {
      mock._store.set('n', JSON.stringify(42));
      expect(store.get<number>('n')).toBe(42);
    });

    it('handles primitive types: boolean', () => {
      mock._store.set('b', JSON.stringify(false));
      expect(store.get<boolean>('b')).toBe(false);
    });

    it('handles array values', () => {
      mock._store.set('arr', JSON.stringify([1, 2, 3]));
      expect(store.get<number[]>('arr')).toEqual([1, 2, 3]);
    });

    it('calls mmkv.getString with the correct key', () => {
      store.get('myKey');
      expect(mock.getString).toHaveBeenCalledWith('myKey');
    });
  });

  describe('set', () => {
    it('serialises and stores a value', () => {
      store.set('k', { a: 1 });
      expect(mock._store.get('k')).toBe(JSON.stringify({ a: 1 }));
    });

    it('overwrites an existing value', () => {
      store.set('k', 'first');
      store.set('k', 'second');
      expect(store.get<string>('k')).toBe('second');
    });

    it('calls mmkv.set with key and serialised value', () => {
      store.set('x', [1, 2]);
      expect(mock.set).toHaveBeenCalledWith('x', JSON.stringify([1, 2]));
    });
  });

  describe('delete', () => {
    it('removes a key that exists', () => {
      store.set('toDelete', 'value');
      store.delete('toDelete');
      expect(store.get('toDelete')).toBeNull();
    });

    it('is a no-op for a key that does not exist', () => {
      expect(() => store.delete('nope')).not.toThrow();
    });

    it('calls mmkv.remove with the correct key', () => {
      store.delete('myKey');
      expect(mock.remove).toHaveBeenCalledWith('myKey');
    });
  });

  describe('round-trip', () => {
    it('set then get returns the original value', () => {
      const value = { id: '123', items: [{ qty: 2 }] };
      store.set('cart', value);
      expect(store.get('cart')).toEqual(value);
    });

    it('set then delete then get returns null', () => {
      store.set('temp', 99);
      store.delete('temp');
      expect(store.get('temp')).toBeNull();
    });
  });
});
