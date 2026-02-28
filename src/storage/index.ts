import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';

export const enum StorageKey {
  CART = 'cart',
  PRODUCT_CACHE = 'product_cache',
}

export interface Storage {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
}

export function createStorage(mmkv: MMKV): Storage {
  return {
    get<T>(key: string): T | null {
      const raw = mmkv.getString(key);
      if (raw === undefined) {
        return null;
      }
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },

    set<T>(key: string, value: T): void {
      mmkv.set(key, JSON.stringify(value));
    },

    delete(key: string): void {
      mmkv.remove(key);
    },
  };
}

const defaultMMKV = createMMKV();
export const storage: Storage = createStorage(defaultMMKV);
