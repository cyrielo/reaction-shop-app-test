import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Product } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Badge from '../../components/Badge';
import PriceDisplay from '../../components/PriceDisplay';

export interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const featuredImage = product.images[0];
  const imageAlt = featuredImage?.altText ?? product.title;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityLabel={`${product.title}, ${product.availableForSale ? 'available' : 'unavailable'}`}
      accessibilityRole="button"
    >
      {featuredImage !== undefined ? (
        <Image
          source={{ uri: featuredImage.url }}
          style={styles.image}
          accessibilityLabel={imageAlt}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>

        <PriceDisplay
          price={product.priceRange.minVariantPrice}
          compareAtPrice={product.compareAtPriceRange.minVariantPrice}
          size="md"
        />

        <Badge
          label={product.availableForSale ? 'In Stock' : 'Out of Stock'}
          variant={product.availableForSale ? 'success' : 'neutral'}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    backgroundColor: colors.border,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizeLg,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
});

export default ProductCard;
