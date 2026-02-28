import React, { useCallback, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CatalogStackParamList } from '../../navigation/types';
import type { ProductVariant, SelectedOption } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../theme';
import useProduct from '../../hooks/useProduct';
import { useCartStore } from '../../store/cartStore';
import VariantSelector from '../../features/product/VariantSelector';
import Button from '../../components/Button';
import PriceDisplay from '../../components/PriceDisplay';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import useMediaQuery from '../../hooks/useMediaQuery';
type Props = NativeStackScreenProps<CatalogStackParamList, 'ProductDetailScreen'>;

function buildInitialSelection(
  variants: ProductVariant[],
): SelectedOption[] {
  if (variants.length === 0) {
    return [];
  }
  return variants[0].selectedOptions.map(o => ({ name: o.name, value: o.value }));
}

function findMatchingVariant(
  variants: ProductVariant[],
  selectedOptions: SelectedOption[],
): ProductVariant | undefined {
  return variants.find(variant =>
    selectedOptions.every(sel =>
      variant.selectedOptions.some(
        vs => vs.name === sel.name && vs.value === sel.value,
      ),
    ),
  );
}

const DetailSkeleton: React.FC = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <SkeletonLoader width="100%" height={320} />
    <View style={styles.body}>
      <SkeletonLoader width="80%" height={28} />
      <SkeletonLoader width="40%" height={22} />
      <SkeletonLoader width="100%" height={80} />
      <SkeletonLoader width="60%" height={44} />
    </View>
  </ScrollView>
);

const ProductDetailScreen: React.FC<Props> = ({ route }) => {
  const { productId } = route.params;
  const { data: product, isLoading, isError } = useProduct(productId);
  const { breakpoint } = useMediaQuery();
  const addItem = useCartStore(state => state.addItem);

  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const initialised = React.useRef(false);

  // Initialise selection once product loads
  if (product !== undefined && !initialised.current) {
    initialised.current = true;
    setSelectedOptions(buildInitialSelection(product.variants));
  }

  const handleSelect = useCallback((name: string, value: string): void => {
    setSelectedOptions(prev =>
      prev.map(o => (o.name === name ? { name, value } : o)),
    );
  }, []);

  const handleAddToCart = useCallback((): void => {
    if (product === undefined) {
      return;
    }
    const variant = findMatchingVariant(product.variants, selectedOptions);
    if (variant === undefined || !variant.availableForSale) {
      return;
    }
    addItem({
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      image: variant.image ?? product.images[0] ?? null,
      quantity: 1,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  }, [product, selectedOptions, addItem]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || product === undefined) {
    return (
      <EmptyState
        title="Product not found"
        message="This product could not be loaded."
      />
    );
  }

  const selectedVariant = findMatchingVariant(product.variants, selectedOptions);
  const canAddToCart =
    selectedVariant !== undefined && selectedVariant.availableForSale;
  const currentImage =
    selectedVariant?.image ?? product.images[0];
  const largeScreen = breakpoint === 'lg';
  const resizeMode = breakpoint === 'lg' ? 'cover' : 'contain';
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={{
        flexDirection: (largeScreen) ? 'row' : 'column',
        gap: 10,
      }}>
        {/* Image container */}
        <View style={styles.imageContainer}>
          {currentImage !== undefined ? (
            <Image
              source={{ uri: currentImage.url }}
              style={styles.image}
              accessibilityLabel={currentImage.altText ?? product.title}
              resizeMode={resizeMode}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
        </View>
        {/* Description container */}
        <View style={styles.descriptionContainer}>
          <View style={styles.body}>
            <Text style={styles.title}>{product.title}</Text>

            {selectedVariant !== undefined && (
              <PriceDisplay
                price={selectedVariant.price}
                compareAtPrice={selectedVariant.compareAtPrice ?? undefined}
                size="lg"
              />
            )}

            {!canAddToCart && selectedVariant !== undefined && (
              <Text style={styles.unavailable}>Currently unavailable</Text>
            )}

            {product.options.length > 0 && (
              <VariantSelector
                options={product.options}
                variants={product.variants}
                selectedOptions={selectedOptions}
                onSelect={handleSelect}
              />
            )}

            <Text style={styles.description}>{product.description}</Text>

            <Button
              label={addedFeedback ? 'Added!' : 'Add to Cart'}
              onPress={handleAddToCart}
              variant="primary"
              disabled={!canAddToCart}
              accessibilityLabel={
                canAddToCart ? 'Add to cart' : 'This variant is unavailable'
              }
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  imageContainer: {
    flex: 1
  },
  descriptionContainer: {
    flex: 2
  },
  image: {
    width: '100%',
    height: 320,
  },
  imagePlaceholder: {
    backgroundColor: colors.border,
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.sizeXxl,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  unavailable: {
    fontSize: typography.sizeSm,
    color: colors.error,
    fontWeight: typography.weightMedium,
  },
  description: {
    fontSize: typography.sizeMd,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default ProductDetailScreen;
