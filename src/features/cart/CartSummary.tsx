import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCartStore } from '../../store/cartStore';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { formatCurrency } from '../../utils/formatCurrency';

const CartSummary: React.FC = () => {
  const subtotal = useCartStore(state => state.subtotal);
  const totalItemCount = useCartStore(state => state.totalItemCount);

  const subtotalValue = subtotal();
  const itemCount = totalItemCount();

  // Format as a Money object using the first item's currency code, fallback to CAD
  const items = useCartStore(state => state.items);
  const currencyCode = items[0]?.price.currencyCode ?? 'CAD';

  const subtotalMoney = { amount: subtotalValue.toFixed(2), currencyCode };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.subtotal}>{formatCurrency(subtotalMoney)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(subtotalMoney)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.sizeMd,
    color: colors.textSecondary,
  },
  subtotal: {
    fontSize: typography.sizeMd,
    color: colors.text,
    fontWeight: typography.weightMedium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  totalLabel: {
    fontSize: typography.sizeLg,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.sizeLg,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
});

export default CartSummary;
