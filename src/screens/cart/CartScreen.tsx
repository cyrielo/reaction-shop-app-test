/**
 * UX decision — remove button rather than swipe-to-remove:
 * A trash icon button is always visible alongside the QuantitySelector.
 * Rationale: product browsing apps are typically used one-handed on mobile;
 * a visible remove affordance is faster and more discoverable than a swipe
 * gesture, which is also harder to implement accessibly.
 */
import React, { useCallback } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { CartItem } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useCartStore } from '../../store/cartStore';
import useAppNavigation from '../../navigation/useAppNavigation';
import Card from '../../components/Card';
import QuantitySelector from '../../components/QuantitySelector';
import EmptyState from '../../components/EmptyState';
import CartSummary from '../../features/cart/CartSummary';
import { formatCurrency } from '../../utils/formatCurrency';
import useMediaQuery from '../../hooks/useMediaQuery';

interface CartLineItemProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

const CartLineItem: React.FC<CartLineItemProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) => (
  <Card title={item.title}>
    <View style={styles.lineItem}>
      {item.image !== null && item.image !== undefined ? (
        <Image
          source={{ uri: item.image.url }}
          style={styles.thumbnail}
          accessibilityLabel={item.image.altText ?? item.title}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
      )}

      <View style={styles.lineBody}>
        <Text style={styles.variantTitle}>{item.variantTitle}</Text>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>

        <View style={styles.lineFooter}>
          <QuantitySelector
            value={item.quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            min={1}
            accessibilityLabel={`Quantity for ${item.title}`}
          />

          <Pressable
            onPress={onRemove}
            style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
            accessibilityLabel={`Remove ${item.title} from cart`}
            accessibilityRole="button"
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Card>
);


const CartScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const { items, increaseQuantity, removeItem, decreaseQuantity } = useCartStore();
  const { breakpoint } = useMediaQuery();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Add items from the catalog to get started."
        actionLabel="Browse Products"
        onAction={() => navigation.navigate('Catalog')}
      />
    );
  }

  const renderItem = ({ item }: { item: CartItem }): React.ReactElement => (
    <CartLineItem
      item={item}
      onIncrease={() => increaseQuantity(item.variantId)}
      onDecrease={() => decreaseQuantity(item.variantId)}
      onRemove={() => removeItem(item.variantId)}
    />
  );

  const keyExtractor = (item: CartItem): string => item.variantId;
  const largeScreen = breakpoint === 'lg';

  return (
    <View style={{
      ...styles.container,
      flexDirection: (largeScreen) ? 'row' : 'column',
      gap: spacing.md
    }}>
      <View style={{
        flex: 2,
      }}>
        <FlashList
          data={[...items]}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={null}
        />
      </View>
      <View style={{
        flex: (largeScreen) ? 1 : 0,
        bottom: (largeScreen) ? 0 : spacing.md,
        }}>
        <CartSummary />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    marginHorizontal: spacing.md,
  },
  cartSummarycontainer: {
    flex: 1,
  },
  lineItem: {
    flex: 2,
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.border,
  },
  lineBody: {
    flex: 1,
    gap: spacing.xs,
  },
  variantTitle: {
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
  },
  price: {
    fontSize: typography.sizeMd,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  lineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  removeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  removeBtnPressed: {
    opacity: 0.5,
  },
  removeText: {
    fontSize: typography.sizeSm,
    color: colors.error,
    fontWeight: typography.weightMedium,
  },
});

export default CartScreen;
