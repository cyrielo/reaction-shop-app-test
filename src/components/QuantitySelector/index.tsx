import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

export interface QuantitySelectorProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  productTitle: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onIncrease,
  onDecrease,
  min = 1,
  max,
  productTitle,
}) => {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onDecrease}
        disabled={atMin}
        style={({ pressed }) => [styles.button, atMin && styles.buttonDisabled, pressed && styles.pressed]}
        accessibilityLabel={`Decrease quantity of ${productTitle}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: atMin }}
      >
        <Text style={[styles.buttonText, atMin && styles.buttonTextDisabled]} importantForAccessibility="no">−</Text>
      </Pressable>

      <Text style={styles.value} accessibilityLabel={`Quantity: ${value}`}>
        {value}
      </Text>

      <Pressable
        onPress={onIncrease}
        disabled={atMax}
        style={({ pressed }) => [styles.button, atMax && styles.buttonDisabled, pressed && styles.pressed]}
        accessibilityLabel={`Increase quantity of ${productTitle}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!atMax }}
      >
        <Text style={[styles.buttonText, atMax && styles.buttonTextDisabled]} importantForAccessibility="no">+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  buttonDisabled: {
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: typography.sizeXl,
    color: colors.text,
    lineHeight: 22,
  },
  buttonTextDisabled: {
    color: colors.disabled,
  },
  value: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: typography.sizeMd,
    fontWeight: typography.weightMedium,
    color: colors.text,
    paddingHorizontal: spacing.xs,
  },
});

export default QuantitySelector;
