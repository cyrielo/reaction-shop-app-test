import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

export interface BadgeProps {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'neutral';
}

const BG: Record<BadgeProps['variant'], string> = {
  success: '#D4EDDA',
  warning: '#FFF3CD',
  error: '#F8D7DA',
  neutral: colors.border,
};

const TEXT_COLOR: Record<BadgeProps['variant'], string> = {
  success: '#155724',
  warning: '#856404',
  error: '#721C24',
  neutral: colors.textSecondary,
};

const Badge: React.FC<BadgeProps> = ({ label, variant }) => (
  <View
    style={[styles.container, { backgroundColor: BG[variant] }]}
    accessible
    accessibilityRole="text"
    accessibilityLabel={label}
  >
    <Text style={[styles.text, { color: TEXT_COLOR[variant] }]} importantForAccessibility="no">{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
  },
});

export default Badge;
