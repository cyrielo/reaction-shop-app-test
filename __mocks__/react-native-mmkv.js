// Jest mock for react-native-mmkv
// Provides an in-memory store so tests can exercise storage-dependent code
// without requiring native Nitro/TurboModule infrastructure.

const store = new Map();

const mockMMKV = {
  getString: jest.fn((key) => store.get(key)),
  set: jest.fn((key, value) => store.set(key, value)),
  remove: jest.fn((key) => store.delete(key)),
  delete: jest.fn((key) => store.delete(key)),
  contains: jest.fn((key) => store.has(key)),
  getAllKeys: jest.fn(() => Array.from(store.keys())),
  clearAll: jest.fn(() => store.clear()),
};

module.exports = {
  createMMKV: jest.fn(() => mockMMKV),
  MMKV: jest.fn(() => mockMMKV),
};
