import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Money } from '../../types';
import { colors, typography } from '../../theme';
import { formatCurrency } from '../../utils/formatCurrency';

export interface PriceDisplayProps {
  price: Money;
  compareAtPrice?: Money;
  size: 'sm' | 'md' | 'lg';
}

const FONT_SIZE: Record<PriceDisplayProps['size'], number> = {
  sm: typography.sizeSm,
  md: typography.sizeMd,
  lg: typography.sizeLg,
};

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  compareAtPrice,
  size,
}) => {
  const fontSize = FONT_SIZE[size];
  const hasDiscount =
    compareAtPrice !== undefined &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <View style={styles.row}>
      <Text style={[styles.price, { fontSize }]}>{formatCurrency(price)}</Text>
      {hasDiscount && compareAtPrice !== undefined && (
        <Text style={[styles.compareAt, { fontSize }]}>
          {formatCurrency(compareAtPrice)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    color: colors.text,
    fontWeight: typography.weightBold,
  },
  compareAt: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
});

export default PriceDisplay;
