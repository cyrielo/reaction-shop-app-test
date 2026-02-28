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
import QuantitySelector from '../../components/QuantitySelector';
import EmptyState from '../../components/EmptyState';
import CartSummary from '../../features/cart/CartSummary';
import { formatCurrency } from '../../utils/formatCurrency';

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
      <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
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
);

const ItemSeparator: React.FC = () => <View style={separatorStyle.line} />;

const separatorStyle = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});

const CartScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const items = useCartStore(state => state.items);
  const increaseQuantity = useCartStore(state => state.increaseQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  const handleDecrease = useCallback((item: CartItem): void => {
    if (item.quantity <= 1) {
      removeItem(item.variantId);
    } else {
      // Decrease by mutating quantity — store only exposes increaseQuantity,
      // so we remove and re-add with decremented quantity
      removeItem(item.variantId);
      useCartStore.getState().addItem({ ...item, quantity: item.quantity - 1 });
    }
  }, [removeItem]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Add items from the catalog to get started."
        actionLabel="Browse Products"
        onAction={() => navigation.navigate('CatalogScreen')}
      />
    );
  }

  const renderItem = ({ item }: { item: CartItem }): React.ReactElement => (
    <CartLineItem
      item={item}
      onIncrease={() => increaseQuantity(item.variantId)}
      onDecrease={() => handleDecrease(item)}
      onRemove={() => removeItem(item.variantId)}
    />
  );

  const keyExtractor = (item: CartItem): string => item.variantId;

  return (
    <View style={styles.container}>
      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
      />
      <CartSummary />
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
  lineItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
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
  itemTitle: {
    fontSize: typography.sizeMd,
    fontWeight: typography.weightMedium,
    color: colors.text,
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
