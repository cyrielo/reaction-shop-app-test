# Reaction — Shopify Product Browser

A React Native shopping app that fetches products from a Shopify-compatible JSON feed, lets users browse a catalog, view product details with variant selection, and manage a persistent cart.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Setup](#2-setup)
3. [Environment Variables](#3-environment-variables)
4. [Running the App](#4-running-the-app)
5. [Running Tests](#5-running-tests)
6. [Architecture](#6-architecture)
7. [Notable Tradeoffs & Assumptions](#7-notable-tradeoffs--assumptions)

---

## 1. Prerequisites

Ensure the following tools are installed **before** cloning the repo. If this is your first React Native project, follow the [official environment setup guide](https://reactnative.dev/docs/set-up-your-environment) for your OS.

| Tool | Minimum version | Notes |
|---|---|---|
| Node.js | 22.11.0 | Enforced by `engines` in `package.json` |
| npm | 10+ | Comes with Node |
| Ruby | 3.x | Required for CocoaPods (iOS only) |
| CocoaPods | 1.15+ | `gem install cocoapods` |
| Xcode | 15+ | iOS builds — macOS only |
| Android Studio | Hedgehog+ | Android builds; includes SDK & emulator |
| Java (JDK) | 17 | Required by the Android toolchain |

Verify your setup:

```sh
node --version          # should print v22.x.x
npx react-native doctor # checks all environment dependencies
```

---

## 2. Setup

### Clone and install JS dependencies

```sh
git clone <repo-url>
cd shopify-product-browser
npm install
```

### iOS — link native dependencies

Run this once after cloning, and again whenever you add or update a native package:

```sh
bundle install           # installs the correct CocoaPods version via Bundler
bundle exec pod install  # links iOS native dependencies under ios/Pods/
```

### Android — no extra steps

Gradle resolves native dependencies automatically on the first build.

---

## 3. Environment Variables

**None required.** The product feed URL is a public GitHub Gist hardcoded in [`src/requests/products.ts`](src/requests/products.ts):

```
https://gist.githubusercontent.com/agorovyi/40dcd166a38b4d1e9156ad66c87111b7/raw/.../testProducts.json
```

To point the app at a different feed, update `PRODUCTS_FEED_URL` in that file. The feed must return a JSON array whose items conform to the `RawProductSchema` defined in [`src/helpers/product.ts`](src/helpers/product.ts).

---

## 4. Running the App

### Step 1 — start the Metro bundler

Metro is the JavaScript bundler that powers Fast Refresh. Keep it running in a dedicated terminal.

```sh
npm start
```

### Step 2 — launch on a simulator or device

Open a **second terminal** and run:

#### iOS

```sh
npm run ios
```

To target a specific simulator:

```sh
npm run ios -- --simulator="iPhone 16 Pro"
```

#### Android

Start an emulator from Android Studio (AVD Manager) first, then:

```sh
npm run android
```

Or connect a physical Android device with **USB debugging** enabled.

### Reloading during development

| Platform | Reload action |
|---|---|
| iOS Simulator | Press `R` |
| Android Emulator | Press `R` twice, or `Cmd ⌘ + M` → Reload |
| Physical device (both) | Shake the device → tap Reload |

---

## 5. Running Tests

```sh
npm test                                          # run the full suite
npm test -- --watch                               # re-run on file changes
npm test -- --testPathPattern="components"        # filter by path substring
```

### Type-check and lint

```sh
npm run typecheck              # tsc --noEmit — must report zero errors
npx eslint src/ --ext .ts,.tsx # must report zero errors
```

### Test coverage by layer

| Folder | What is tested |
|---|---|
| `__tests__/storage/` | MMKV abstraction — get / set / delete / round-trip |
| `__tests__/requests/` | `fetchProducts`, `fetchProduct`, `queryClient` persistence |
| `__tests__/helpers/` | Zod schema validation, `transformProduct` field mapping |
| `__tests__/store/` | Zustand `cartStore` — all actions and derived selectors |
| `__tests__/hooks/` | `useProducts`, `useProduct`, `useMediaQuery` |
| `__tests__/components/` | UI primitives — rendering, accessibility, interactions |
| `__tests__/features/` | `VariantSelector` availability logic, `ProductCard`, `CartSummary` |

---

## 6. Architecture

### High-level diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Native App                          │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Navigation Layer                        │ │
│  │  RootNavigator (Bottom Tabs)                               │ │
│  │  ├── Catalog Tab                                           │ │
│  │  │   ├── CatalogScreen       (FlashList of ProductCards)  │ │
│  │  │   └── ProductDetailScreen (variants + Add to Cart CTA) │ │
│  │  └── Cart Tab                                              │ │
│  │      └── CartScreen          (FlashList + CartSummary)    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                │                       │                        │
│       ┌────────┘               ┌───────┘                        │
│       ▼                        ▼                                │
│  ┌──────────────┐       ┌─────────────┐   ┌──────────────────┐  │
│  │  TanStack    │       │   Zustand   │   │  src/components/ │  │
│  │  Query       │       │  cartStore  │   │  (UI primitives) │  │
│  │  server state│       │  cart state │   │  Button, Badge,  │  │
│  │  + caching   │       │  + derived  │   │  PriceDisplay,   │  │
│  └──────┬───────┘       │  selectors  │   │  QuantitySelector │  │
│         │               └─────────────┘   └──────────────────┘  │
│         ▼                      │                                │
│  ┌──────────────┐              ▼                                │
│  │ src/requests/│       ┌─────────────┐                         │
│  │ products.ts  │       │ src/storage/│  MMKV abstraction       │
│  │ queryClient  │──────▶│ index.ts    │  PRODUCT_CACHE  (query) │
│  └──────┬───────┘       │             │  CART           (items) │
│         │               └──────┬──────┘                         │
│         │                      │                                │
│         ▼                      ▼                                │
│  Public JSON feed       react-native-mmkv                       │
│  (Shopify-compatible)   (Nitro / JSI — synchronous native I/O)  │
└─────────────────────────────────────────────────────────────────┘
```

### Folder structure

```
src/
├── components/   # Shared UI primitives — Button, Badge, PriceDisplay, …
├── features/     # Feature-scoped components — ProductCard, VariantSelector, CartSummary
├── screens/      # Full screens mounted by the navigator
│   ├── catalog/  #   CatalogScreen
│   ├── product/  #   ProductDetailScreen
│   └── cart/     #   CartScreen
├── hooks/        # Shared hooks — useProducts, useProduct, useMediaQuery
├── navigation/   # Navigator config and typed param lists
├── requests/     # fetch functions and queryClient singleton
├── store/        # Zustand stores — cartStore
├── storage/      # MMKV abstraction (only file allowed to import MMKV directly)
├── helpers/      # Zod schemas and domain transformers — product.ts
├── theme/        # Colors, spacing, typography, borderRadius (all as const)
├── types/        # Domain type definitions — Product, CartItem, Money, …
└── utils/        # Pure utilities — formatCurrency
```

### Data flow — browsing and adding to cart

```
CatalogScreen
  └─ useProducts()                    TanStack Query hook
       └─ fetchProducts()             fetch → Zod.parse → transformProduct()
            └─ PRODUCTS_FEED_URL      Public JSON feed
  └─ FlashList → ProductCard[]
       └─ onPress → navigate("ProductDetailScreen", { productId })

ProductDetailScreen
  └─ useProduct(id)                   Returns cached data if fresh (< 5 min)
  └─ VariantSelector                  isOptionValueAvailable() computed per chip
  └─ "Add to Cart" → cartStore.addItem()
       └─ storage.set("cart", items)  Synchronous MMKV persist
```

### Offline / persistence strategy

| Key | Store | Content | Written |
|---|---|---|---|
| `product_cache` | MMKV | Dehydrated TanStack Query state | On every cache mutation |
| `cart` | MMKV | Serialised `CartItem[]` | On every cart action |

On app start, `queryClient.ts` calls `restoreCache()`, which reads `product_cache` from MMKV and rehydrates the query cache — so the catalog loads instantly from disk even before the network request completes.

---
