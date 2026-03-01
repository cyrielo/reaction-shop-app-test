# Decision Log

## How I Used AI

I set up a local Claude agent (Claude Code CLI) and created a `CLAUDE.md` project guide to give it persistent context about the stack, folder conventions, and critical rules. From there I worked in phases:

1. **Bootstrapping** — AI generated the initial folder structure, TypeScript config, navigation wiring, and Zod schemas. I reviewed and approved each piece before moving on.
2. **Feature implementation** — I wrote targeted prompts for each screen and component (ProductCard, VariantSelector, CartSummary, etc.), reviewed the output, and iterated on specifics like accessibility labels and edge case handling.
3. **Test suite** — AI generated the full `__tests__/` suite mirroring `src/`. I caught and corrected several test errors manually (wrong RNTL query APIs, missing TypeScript types, a Jest open-handle bug from TanStack Query's GC timer).
4. **Code review pass** — After each phase I reviewed for duplication and complexity, then prompted the AI to simplify where needed.

I treated the AI as a fast pair programmer — it wrote the first draft, I reviewed, corrected, and owned the final output.

---

## What I Changed or Rejected

| Decision | What happened |
|---|---|
| `estimatedItemSize` on FlashList | Removed — FlashList v2 dropped this prop; AI initially included it from outdated docs |
| Inline arrow functions as `ItemSeparatorComponent` | Replaced with stable named components — ESLint `react/no-unstable-nested-components` rule rejects them |
| `getByRole('text')` in Badge tests | Replaced with `getByLabelText` — the query matched both the View and inner Text, causing ambiguous selector errors |
| `queryByType` in ProductCard tests | Replaced with `UNSAFE_queryAllByType` — the former doesn't exist on RNTL's render result |
| `new MMKV()` constructor | Replaced with `createMMKV()` factory — MMKV v4 changed the API |
| Inline color/spacing values | Always replaced with `src/theme` imports — hardcoding was caught during review |
| Detox / Maestro E2E tests | Skipped — out of scope for this exercise; unit + integration coverage was prioritised |

---

## Key Technical Tradeoffs

**Static JSON feed instead of Shopify Storefront API**
Products come from a single public GitHub Gist. This removes the need for API keys during review but means the catalogue is static. Switching to real GraphQL would require replacing `src/requests/products.ts` and updating the Zod schemas.

**`fetchProduct` re-fetches all products**
There is no single-product endpoint on the static feed, so `fetchProduct(id)` calls `fetchProducts()` and filters client-side. With the Storefront API this would be a single targeted query.

**Cart is local only**
Cart state persists to MMKV and survives restarts, but is not synced to a Shopify checkout or customer account. A real checkout flow would normally need the Storefront API's Cart mutations.

**Availability is computed from feed data**
`isOptionValueAvailable()` derives availability from the `availableForSale` flag per variant. There is no real-time inventory check — stock is only as fresh as the last fetch.

**Single currency**
`formatCurrency` uses `Intl.NumberFormat` with the currency code on each `Money` object (CAD). Multi-currency and locale switching are not implemented.

---

## What I Would Improve With More Time

**UI & interactions**
- **Add-to-cart feedback** — a spring scale animation on the cart tab badge and a short haptic pulse (`ReactNativeHapticFeedback` or the built-in `Haptics` API) so the user feels the action land, not just sees a counter increment.
- **Image carousel on the product detail screen** — swipe left/right through all product images using a `FlatList` in horizontal paginated mode with dot indicators below, instead of showing only the first image.
- **Pinch-to-zoom / fullscreen image viewer** — tapping any product image opens a modal with `react-native-image-zoom-viewer` (or a custom `PanResponder` + `Animated` implementation) so users can inspect texture and detail before buying.
- **Shared element transition** — animate the product image from the catalog card into the detail screen header using `react-native-shared-element`, giving the navigation a polished, continuous feel.
- **Swipe-to-remove on cart items** — replace the explicit remove button with a swipe gesture (e.g. `react-native-swipeable` or a custom `Animated` pan) that reveals a delete action, matching the interaction pattern users expect from native list apps.
- **Skeleton shimmer on the product detail screen** — the detail screen currently has no loading state; adding an animated shimmer skeleton while the query resolves would feel much more complete.

**Functional improvements**
- **Pagination on the catalog** — the current feed loads all products in a single request. With a real API, I'd switch to TanStack Query's `useInfiniteQuery`, fetching one page at a time. The `FlashList` `onEndReached` callback would trigger the next page automatically, with a "Load more" button as a fallback footer for users who reach the bottom before the next page loads.
- **Real Shopify Storefront API** — replace the static feed with GraphQL queries and expose live inventory.
- **Checkout flow** — wire up Storefront API cart mutations and a payment sheet (Apple Pay / Google Pay via `@stripe/stripe-react-native` or Shopify's own SDK).
- **Optimistic cart updates** — currently cart writes are synchronous MMKV calls; with a real backend I'd add optimistic updates and rollback on failure.
- **Image placeholders and progressive loading** — add blurhash or a low-res placeholder while product images load.
- **E2E tests** — add Maestro or Detox flows covering browse → add to cart → checkout.
- **Multi-currency and localisation** — proper `Intl` locale support and currency switching.
- **Accessibility audit** — run a full VoiceOver / TalkBack pass on a physical device; axe-core for automated checks.
