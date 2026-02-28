import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { Product } from '../../types';
import { colors, spacing, typography } from '../../theme';
import useProducts from '../../hooks/useProducts';
import useAppNavigation from '../../navigation/useAppNavigation';
import ProductCard from '../../features/catalog/ProductCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';
import ErrorBoundary from '../../components/ErrorBoundary';

const SKELETON_COUNT = 4;

const CatalogSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <View key={i} style={styles.skeletonCard}>
        <SkeletonLoader width="100%" height={200} />
        <View style={styles.skeletonBody}>
          <SkeletonLoader width="75%" height={18} />
          <SkeletonLoader width="40%" height={16} />
          <SkeletonLoader width={60} height={22} borderRadius={4} />
        </View>
      </View>
    ))}
  </View>
);

const ErrorFallback: React.FC = () => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>
      We couldn't load the products. Please try again.
    </Text>
  </View>
);

const CatalogScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const { data: products, isLoading, isError } = useProducts();

  if (isLoading) {
    return <CatalogSkeleton />;
  }

  if (isError) {
    return (
      <ErrorBoundary fallback={<ErrorFallback />}>
        <ErrorFallback />
      </ErrorBoundary>
    );
  }

  if (products === undefined || products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        message="Check back later for new arrivals."
      />
    );
  }

  const handlePress = (product: Product): void => {
    navigation.navigate('ProductDetailScreen', { productId: product.id });
  };

  const renderItem = ({ item }: { item: Product }): React.ReactElement => (
    <ProductCard product={item} onPress={() => handlePress(item)} />
  );

  const keyExtractor = (item: Product): string => item.id;

  return (
    <View style={styles.container}>
      <FlashList
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingVertical: spacing.sm,
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  skeletonBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizeXl,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: typography.sizeMd,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default CatalogScreen;
