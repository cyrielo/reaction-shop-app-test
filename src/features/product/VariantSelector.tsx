import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ProductOption, ProductVariant, SelectedOption } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../theme';

export interface VariantSelectorProps {
  options: ProductOption[];
  variants: ProductVariant[];
  selectedOptions: SelectedOption[];
  onSelect: (name: string, value: string) => void;
}

/**
 * Returns true if the given option name+value is available when combined with
 * the current selection of all *other* options.
 *
 * Logic: for every other currently-selected option, find a variant that
 * matches both that selection AND the candidate value. If at least one such
 * variant is availableForSale, the candidate is selectable.
 */
function isOptionValueAvailable(
  candidate: { name: string; value: string },
  selectedOptions: SelectedOption[],
  variants: ProductVariant[],
): boolean {
  // Build the selection we'd have if we picked this candidate value
  const hypothetical: SelectedOption[] = selectedOptions.map(opt =>
    opt.name === candidate.name ? { name: opt.name, value: candidate.value } : opt,
  );

  return variants.some(variant => {
    const matchesAll = hypothetical.every(sel =>
      variant.selectedOptions.some(
        vs => vs.name === sel.name && vs.value === sel.value,
      ),
    );
    return matchesAll && variant.availableForSale;
  });
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  options,
  variants,
  selectedOptions,
  onSelect,
}) => (
  <View style={styles.container}>
    {options.map(option => {
      const currentValue = selectedOptions.find(
        s => s.name === option.name,
      )?.value;

      return (
        <View key={option.id} style={styles.group}>
          <Text style={styles.optionName}>{option.name}</Text>
          <View style={styles.values}>
            {option.values.map(value => {
              const isSelected = currentValue === value;
              const isAvailable = isOptionValueAvailable(
                { name: option.name, value },
                selectedOptions,
                variants,
              );

              return (
                <Pressable
                  key={value}
                  onPress={() => isAvailable && onSelect(option.name, value)}
                  disabled={!isAvailable}
                  accessibilityLabel={`${option.name}: ${value}${!isAvailable ? ', unavailable' : ''}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                  style={({ pressed }) => [
                    styles.chip,
                    isSelected && styles.chipSelected,
                    !isAvailable && styles.chipUnavailable,
                    pressed && isAvailable && styles.chipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                      !isAvailable && styles.chipTextUnavailable,
                    ]}
                  >
                    {value}
                  </Text>
                  {!isAvailable && <View style={styles.strikethrough} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  group: {
    gap: spacing.sm,
  },
  optionName: {
    fontSize: typography.sizeMd,
    fontWeight: typography.weightMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  values: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipUnavailable: {
    borderColor: colors.border,
    backgroundColor: colors.background,
    opacity: 0.5,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: typography.sizeMd,
    fontWeight: typography.weightMedium,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  chipTextUnavailable: {
    color: colors.disabled,
  },
  // Diagonal strikethrough for unavailable chips
  strikethrough: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1.5,
    backgroundColor: colors.disabled,
    transform: [{ rotate: '-15deg' }],
  },
});

export default VariantSelector;
