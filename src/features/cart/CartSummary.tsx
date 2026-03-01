import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCartStore } from '../../store/cartStore';
import { colors, spacing, typography } from '../../theme';
import { formatCurrency } from '../../utils/formatCurrency';
import Card from '../../components/Card';

const CartSummary: React.FC = () => {
  const subtotal = useCartStore(state => state.subtotal);
  const totalItemCount = useCartStore(state => state.totalItemCount);

  const subtotalValue = subtotal();
  const itemCount = totalItemCount();

  const items = useCartStore(state => state.items);
  const currencyCode = items[0]?.price.currencyCode ?? 'CAD';

  const subtotalMoney = { amount: subtotalValue.toFixed(2), currencyCode };

  return (
    <Card title="Cart Summary" style={styles.card}>
      <View style={styles.body}>
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
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  body: {
    gap: spacing.sm,
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
