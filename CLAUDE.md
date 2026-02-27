# CLAUDE.md — Shopify React Native Product Browser App

## Stack
- React Native CLI (no Expo) — pure RN
- TypeScript strict mode (no `any`, explicit return types)
- React Navigation 6 (NativeStackNavigator)
- Zustand for cart/product state
- TanStack Query for data fetching and offline caching
- MMKV for local persistence
- FlashList for all scrollable lists (never FlatList)
- Jest + React Native Testing Library for tests

## Folder Structure
src/
  api/          # fetch logic, response transformers
  components/   # shared UI primitives only (Button, Badge, etc.)
  features/
    catalog/    # ProductList, ProductCard, useProducts
    cart/       # CartScreen, CartItem, CartSummary
    product/    # ProductDetail, VariantSelector
  hooks/        # shared hooks (useOfflineStatus, etc.)
  navigation/   # navigators, typed params
  store/        # Zustand stores
  storage/      # MMKV abstraction (never import MMKV directly)
  theme/        # colors, spacing, typography — no hardcoded values
  types/        # all domain types live here
  utils/        # formatCurrency, etc.

## Critical Rules
- NEVER import from another feature folder
- NEVER use FlatList — always FlashList
- NEVER hardcode colors or spacing — import from src/theme
- NEVER use AsyncStorage — use src/storage abstraction
- NEVER import MMKV directly outside src/storage/
- NEVER use `any` type
- ALL interactive elements need accessibilityLabel
- ALL components need typed props interfaces named ComponentNameProps

## Component Ownership
- UI primitives (Button, Badge, QuantitySelector, etc.) → src/components/ ONLY
- Feature agents must import from src/components/, never create their own primitives

## Before Closing Any Task
1. Run: npm run typecheck (zero errors)
2. Run: npm run lint src/ --ext .ts,.tsx (zero errors)
3. Run: npm test (no regressions)
4. Update TASKS.md — move task to done, document your exports

## Commit Format
feat(scope): description
e.g. feat(catalog): add ProductList screen with FlashList