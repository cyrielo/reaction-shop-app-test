import { z } from 'zod';
import type {
  Product,
  ProductVariant,
  ProductImage,
  ProductMedia,
  ProductOption,
  Money,
  PriceRange,
} from '../types/product';

// --- Zod schemas (validate raw Shopify Storefront API response) ---

const MoneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string(),
});

const PriceRangeSchema = z.object({
  minVariantPrice: MoneySchema,
  maxVariantPrice: MoneySchema,
});

const ImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  altText: z.string().nullable().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const MediaImageSchema = z.object({
  url: z.string(),
  id: z.string(),
  altText: z.string().nullable(),
  width: z.number(),
  height: z.number(),
});

const MediaSchema = z.object({
  mediaContentType: z.string(),
  image: MediaImageSchema,
});

const OptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(z.string()),
});

const SelectedOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const VariantProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  options: z.array(OptionSchema),
});

const VariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  quantityAvailable: z.number(),
  availableForSale: z.boolean(),
  currentlyNotInStock: z.boolean(),
  price: MoneySchema,
  compareAtPrice: MoneySchema.nullable().optional(),
  sku: z.string(),
  selectedOptions: z.array(SelectedOptionSchema),
  image: ImageSchema.nullable().optional(),
  product: VariantProductSchema,
});

const RawProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  descriptionHtml: z.string(),
  availableForSale: z.boolean(),
  handle: z.string(),
  productType: z.string(),
  tags: z.array(z.string()),
  vendor: z.string(),
  priceRange: PriceRangeSchema,
  compareAtPriceRange: PriceRangeSchema,
  images: z.array(ImageSchema),
  options: z.array(OptionSchema),
  requiresSellingPlan: z.boolean(),
  onlineStoreUrl: z.string().nullable().optional(),
  media: z.array(MediaSchema),
  variants: z.array(VariantSchema),
});

export const ProductsResponseSchema = z.array(RawProductSchema);

type RawMoney = z.infer<typeof MoneySchema>;
type RawPriceRange = z.infer<typeof PriceRangeSchema>;
type RawImage = z.infer<typeof ImageSchema>;
type RawMedia = z.infer<typeof MediaSchema>;
type RawOption = z.infer<typeof OptionSchema>;
export type RawProduct = z.infer<typeof RawProductSchema>;
type RawVariant = z.infer<typeof VariantSchema>;

// --- Transformers: validated raw shape → domain types ---

function transformMoney(raw: RawMoney): Money {
  return { amount: raw.amount, currencyCode: raw.currencyCode };
}

function transformPriceRange(raw: RawPriceRange): PriceRange {
  return {
    minVariantPrice: transformMoney(raw.minVariantPrice),
    maxVariantPrice: transformMoney(raw.maxVariantPrice),
  };
}

function transformImage(raw: RawImage): ProductImage {
  return {
    id: raw.id,
    url: raw.url,
    altText: raw.altText ?? null,
    width: raw.width,
    height: raw.height,
  };
}

function transformMedia(raw: RawMedia): ProductMedia {
  return {
    mediaContentType: raw.mediaContentType,
    image: {
      url: raw.image.url,
      id: raw.image.id,
      altText: raw.image.altText,
      width: raw.image.width,
      height: raw.image.height,
    },
  };
}

function transformOption(raw: RawOption): ProductOption {
  return { id: raw.id, name: raw.name, values: raw.values };
}

function transformVariant(raw: RawVariant): ProductVariant {
  return {
    id: raw.id,
    title: raw.title,
    quantityAvailable: raw.quantityAvailable,
    availableForSale: raw.availableForSale,
    currentlyNotInStock: raw.currentlyNotInStock,
    price: transformMoney(raw.price),
    compareAtPrice: raw.compareAtPrice ? transformMoney(raw.compareAtPrice) : null,
    sku: raw.sku,
    selectedOptions: raw.selectedOptions.map(o => ({ name: o.name, value: o.value })),
    image: raw.image ? transformImage(raw.image) : null,
    product: {
      id: raw.product.id,
      handle: raw.product.handle,
      options: raw.product.options.map(transformOption),
    },
  };
}

export function transformProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    availableForSale: raw.availableForSale,
    handle: raw.handle,
    productType: raw.productType,
    tags: raw.tags,
    vendor: raw.vendor,
    priceRange: transformPriceRange(raw.priceRange),
    compareAtPriceRange: transformPriceRange(raw.compareAtPriceRange),
    images: raw.images.map(transformImage),
    options: raw.options.map(transformOption),
    requiresSellingPlan: raw.requiresSellingPlan,
    onlineStoreUrl: raw.onlineStoreUrl ?? null,
    media: raw.media.map(transformMedia),
    variants: raw.variants.map(transformVariant),
  };
}
