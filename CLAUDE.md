# CLAUDE.md — Shopify React Native Product Browser App

## Stack
- React Native CLI (no Expo) — pure RN
- TypeScript strict mode (no `any`, explicit return types)
- React Navigation — NativeStackNavigator + BottomTabNavigator
- Zustand for cart state
- TanStack Query for data fetching and offline caching
- MMKV 4 for local persistence
- FlashList 2 for all scrollable lists (never FlatList)
- Zod for API response validation
- react-native-device-info for tablet/phone orientation detection
- Jest + React Native Testing Library for tests

## Folder Structure
src/
  components/        # Shared UI primitives ONLY (Button, Badge, Card, etc.)
  features/          # Feature-scoped components (ProductCard, VariantSelector, CartSummary)
  screens/
    catalog/         # CatalogScreen
    cart/            # CartScreen
    product/         # ProductDetailScreen
  hooks/             # Shared hooks (useProducts, useProduct, useMediaQuery)
  navigation/        # Navigators, typed params, useAppNavigation
  requests/          # fetch functions, queryClient singleton
  store/             # Zustand stores (cartStore)
  storage/           # MMKV abstraction — ONLY file allowed to import MMKV
  helpers/           # Zod schemas and domain transformers (product.ts)
  theme/             # colors, spacing, typography, borderRadius — no hardcoded values
  types/             # All domain types (Product, CartItem, Money, BreakPoint, …)
  utils/             # Pure utilities (formatCurrency)

__tests__/           # Mirrors src/ structure — never co-locate tests 

Both stack navigators use react-native-device-info to set orientation:
- Tablet  → 'all'     (landscape + portrait)
- Phone   → 'portrait' (locked)

Navigation types live in src/navigation/types.ts:

## Component Ownership
- UI primitives (Button, Badge, Card, QuantitySelector, PriceDisplay, SkeletonLoader,
  EmptyState, ErrorBoundary) → src/components/ ONLY
- Feature-scoped components (ProductCard, VariantSelector, CartSummary) → src/features/
- Screens → src/screens/
- Features and screens MUST import primitives from src/components/, never inline their own

## Critical Rules
- NEVER import from another feature folder
- NEVER use FlatList — always FlashList (v2: estimatedItemSize prop removed, do not use it)
- NEVER hardcode colors or spacing — import from src/theme
- NEVER use AsyncStorage — use src/storage abstraction
- NEVER import MMKV directly outside src/storage/
- NEVER use `any` type
- ALL interactive elements need accessibilityLabel
- ALL components need typed props interfaces named ComponentNameProps
- Test files go in __tests__/ mirroring src/ — never inside src/

## Key Technical Notes
- Prefer stable named component, avoid  inline arrow function

## Before Closing Any Task
1. Run: npm run typecheck   (zero errors — npx tsc --noEmit)
2. Run: npx eslint src/ --ext .ts,.tsx   (zero errors)
3. Run: npm test   (no regressions — 278 tests across 18 suites)
4. Update TASKS.md — move task to done, document your exports

## Commit Format
feat(scope): description
e.g. feat(catalog): add ProductList screen with FlashList