# TASKS.md

## Agent Rules (read before anything else)

### Stub Protocol
The components agent MUST complete its stub pass before catalog and cart
agents write any TSX. Stubs are interfaces + `return null`. This is not
optional. Catalog and cart agents: if you need a component that doesn't
exist in src/components/ yet, STOP and add it to the stub request list
at the bottom of this file. Do not create components inside feature folders.

### File Scope Enforcement
Each agent has an explicit "Owns" and "May Read" list in their task below.
- Owns: you may create and edit these files
- May Read: you may read these for context but never modify them
- Everything else: do not touch

### Merge Order (agent must not merge out of order)
1. setup → main
2. stores → main
3. components stubs → main  (components agent first pass)
4. catalog, cart in parallel → main
5. components final → main  (components agent second pass)
6. tests → main

### Before Marking Any Task Done
- npx tsc --noEmit → zero errors
- npx eslint src/ → zero errors
- npx jest → no regressions
- Update this file: move task to done, list every export by name

---

## Phase 1 — Setup

### Task: Domain Types
**Status:** DONE
**Owns:** src/types/index.ts
**May Read:** nothing (this is the base layer)
**Instructions:**
Define all domain types derived from the Shopify Storefront API shape.
Refer to product.sample.json to derive the correct product shape
Required types: Product, CartItem, Cart, RootStackParamList etc
All types exported as named exports from a single file.
No utility types, no external dependencies.

**Done when:**
- [x] src/types/index.ts exists with all types above
- [x] npx tsc --noEmit passes
- [x] Exports listed below

**Exports:**
Money, PriceRange, ProductImage, MediaImage, ProductMedia, ProductOption,
SelectedOption, VariantProduct, ProductVariant, Product, CartItem, Cart,
RootStackParamList

---

### Task: Navigation
**Status:** DONE
**Owns:** src/navigation/
**May Read:** src/types/index.ts
**Instructions:**
Set up React Navigation with NativeStackNavigator.
Three screens: CatalogScreen, ProductDetailScreen, CartScreen.
ProductDetailScreen receives { productId: string } as params.
RootStackParamList must use the type from src/types/index.ts.
Navigation must be fully type-safe — no `any` in params.
Create a useNavigation typed wrapper hook at src/navigation/useAppNavigation.ts.

**Done when:**
- [x] src/navigation/index.tsx — root navigator
- [x] src/navigation/types.ts — re-exports RootStackParamList
- [x] src/navigation/useAppNavigation.ts — typed hook
- [x] npx tsc --noEmit passes

**Exports:**
RootNavigator (default, index.tsx), RootStackParamList (re-export, types.ts),
useAppNavigation (default), AppNavigationProp (named, useAppNavigation.ts)

---

### Task: Theme Constants
**Status:** DONE
**Owns:** src/theme/
**May Read:** nothing
**Instructions:**
Create design token constants. No hardcoded values anywhere else in the
codebase — everything imports from here.
Required: colors (background, surface, primary, text, textSecondary,
error, border, disabled), spacing (xs:4, sm:8, md:16, lg:24, xl:32),
typography (sizeSm:12, sizeMd:14, sizeLg:16, sizeXl:20, sizeXxl:24,
weightRegular, weightMedium, weightBold), borderRadius (sm:4, md:8, lg:16).

**Done when:**
- [x] src/theme/colors.ts
- [x] src/theme/spacing.ts
- [x] src/theme/typography.ts
- [x] src/theme/index.ts — re-exports everything
- [x] npx tsc --noEmit passes

**Exports:**
colors, Colors (colors.ts), spacing, Spacing (spacing.ts),
typography, borderRadius, Typography, BorderRadius (typography.ts),
all re-exported from index.ts

---

## Phase 2 — Stores
**Agent:** stores
**Branch:** stores
**Worktree:** ../shopify-stores
**Depends on:** Phase 1 merged to main. Pull main before starting.

### Task: MMKV Storage Abstraction
**Status:** TODO
**Owns:** src/storage/
**May Read:** nothing
**Instructions:**
Create a typed storage abstraction over MMKV. No other file in the 
codebase should ever import MMKV directly.
Export a single storage object with: get<T>(key: string): T | null, 
set<T>(key: string, value: T): void, delete(key: string): void.
Keys must be defined as a const enum StorageKey in this file:
CART = 'cart', PRODUCT_CACHE = 'product_cache'.
The abstraction must be mockable for tests — export a createStorage 
factory function as well as the default instance.

**Done when:**
- [ ] src/storage/index.ts
- [ ] npx tsc --noEmit passes

**Exports:**
(agent fills this in when done)

---

### Task: Cart Zustand Store
**Status:** TODO
**Owns:** src/store/cartStore.ts
**May Read:** src/types/index.ts, src/storage/index.ts
**Instructions:**
Build the cart store using Zustand with persistence via the storage 
abstraction. Never use MMKV directly.
State: items: CartItem[], 
Actions: addItem(item: CartItem), increaseQuantity(variantId: string), 
removeItem(variantId: string), clearCart().
Derived values (computed, not stored): subtotal, totalPrice, totalItemCount.
Cart must rehydrate from storage on app start.
Adding an item that already exists increases its quantity, not duplicates it.

**Done when:**
- [ ] src/store/cartStore.ts
- [ ] npx tsc --noEmit passes

**Exports:**
(agent fills this in when done)

---

### Task: TanStack Query Setup
**Status:** TODO
**Owns:** src/api/
**May Read:** src/types/index.ts, src/storage/index.ts
**Instructions:**
Set up QueryClient with persistQueryClient using MMKV as the persister.
Configure: staleTime 5 minutes, cacheTime 24 hours so catalog is 
available offline.
Create useProducts() hook that fetches from the provided JSON feed URL.
Create useProduct(id: string) hook for single product detail.
Transform raw API response to match Product type from src/types/index.ts.
The fetch URL should be a constant at the top of src/api/products.ts 
so it can be swapped easily.

**Done when:**
- [ ] src/api/queryClient.ts — QueryClient + persister config
- [ ] src/api/products.ts — fetch logic + transformers
- [ ] src/api/hooks/useProducts.ts
- [ ] src/api/hooks/useProduct.ts
- [ ] npx tsc --noEmit passes

**Exports:**
(agent fills this in when done)

---

## Phase 3 — Parallel Features
All three agents start after Phase 2 is merged to main.
Pull main before starting.
Components agent must complete stub pass before catalog and cart 
agents write any imports.

---

### Components Agent — Pass 1 (Stubs)
**Agent:** components
**Branch:** components
**Worktree:** ../shopify-components
**This pass must merge to main before catalog and cart agents proceed past setup.**

**Task: Create Component Stubs**
**Status:** TODO
**Owns:** src/components/
**Instructions:**
Create stub files — typed props interface + `return null` body.
Do not implement yet. The goal is to unblock catalog and cart agents 
with valid TypeScript interfaces to import against.

Required stubs:
- src/components/Button/index.tsx
  Props: label, onPress, variant('primary'|'secondary'|'ghost'), 
  disabled, loading, accessibilityLabel
- src/components/Badge/index.tsx
  Props: label, variant('success'|'warning'|'error'|'neutral')
- src/components/QuantitySelector/index.tsx
  Props: value, onIncrease, onDecrease, min, max, accessibilityLabel
- src/components/SkeletonLoader/index.tsx
  Props: width, height, borderRadius
- src/components/EmptyState/index.tsx
  Props: title, message, actionLabel?, onAction?
- src/components/ErrorBoundary/index.tsx
  Props: children, fallback
- src/components/PriceDisplay/index.tsx
  Props: price: Money, compareAtPrice?: Money, size('sm'|'md'|'lg')

Commit message: feat(components): add component stubs for Phase 3 unblocking
Then immediately notify: stubs are ready, catalog and cart may proceed.

---

### Components Agent — Pass 2 (Implementation)
Runs concurrently with catalog and cart after stubs merge.
**Owns:** src/components/ (same branch, continue working)
**May Read:** src/theme/index.ts, src/types/index.ts
**Instructions:**
Implement each stub with full production quality.
Every component must have: proper accessibility props (accessibilityLabel, 
accessibilityRole, accessibilityState where relevant), touch feedback 
(Pressable with opacity/scale), theme tokens from src/theme (no hardcoded 
values), loading and disabled states where applicable.
SkeletonLoader must animate using Animated.loop.
ErrorBoundary must be a class component (required by React for error boundaries).

---

### Catalog Agent
**Agent:** catalog
**Branch:** catalog
**Worktree:** ../shopify-catalog
**Owns:** src/features/catalog/, src/features/product/
**May Read:** src/components/, src/types/, src/theme/, src/api/, src/navigation/
**Start after:** components stubs merged to main

**Task: ProductList Screen**
**Instructions:**
Product catalog screen using FlashList (never FlatList).
Pull data from useProducts() hook.
Show loading state using SkeletonLoader (from src/components/).
Show EmptyState if no products returned.
Show ErrorBoundary wrapping the list with user-friendly messaging.
Each product renders as ProductCard.
Tapping a card navigates to ProductDetailScreen with productId param.
FlashList estimatedItemSize must be set — measure a typical card.

**Task: ProductCard Component**
Lives at src/features/catalog/ProductCard.tsx (feature-specific, not shared).
Props: product: Product, onPress: () => void.
Shows: featured image, title, price range, availability badge.
Image must have accessibilityLabel from image.altText or product.title.

**Task: ProductDetail Screen**
Shows full product info, image carousel/pager, description.
Variant selection via VariantSelector component.
Add to Cart button — disabled if selected variant unavailable.
On add: calls useCartStore addItem action, shows confirmation feedback.

**Task: VariantSelector Component**
Lives at src/features/product/VariantSelector.tsx.
Renders selectedOptions matrix (e.g. Color + Size).
Unavailable variant combinations must be visually disabled — not just 
greyed out text, but a clear disabled state with strikethrough or 
similar treatment.
This is the most complex UI logic in the app — model it carefully 
against the variants array, not just independent option dropdowns.

---

### Cart Agent
**Agent:** cart
**Branch:** cart
**Worktree:** ../shopify-cart
**Owns:** src/features/cart/
**May Read:** src/components/, src/types/, src/theme/, src/store/cartStore.ts, src/navigation/
**Start after:** components stubs merged to main

**Task: Cart Screen**
Displays cart line items using FlashList.
Empty state when cart is empty with CTA back to catalog.
Each line item: image, title, variant title, price, quantity controls.
Quantity controls use QuantitySelector from src/components/.
Swipe to remove or remove button — your UX call, document the decision.

**Task: CartSummary Component**
Lives at src/features/cart/CartSummary.tsx.
Displays: subtotal, total price, total item count.
Values sourced from useCartStore derived values — not recalculated here.
Sticky at bottom of cart screen.

---

## Phase 4 — Tests
**Agent:** tests
**Branch:** tests
**Worktree:** ../shopify-tests
**Depends on:** all Phase 3 branches merged to main
**Owns:** src/**/*.test.ts, src/**/*.test.tsx
**May Read:** everything, modify nothing except test files

### Required Tests
- Cart store: addItem, increaseQuantity, removeItem, clearCart, 
  rehydration, derived value accuracy, duplicate item handling
- formatCurrency utility: various currencies, zero amounts, rounding
- Variant availability logic: unavailable combination detection
- useProducts hook: loading state, error state, offline cache hit
- VariantSelector: unavailable combinations render as disabled

---

## Stub Request List
(Catalog or cart agents: if you need a component not listed above, 
add it here and the components agent will stub it)

---

## Done Log
(Agents move completed tasks here with their exports listed)