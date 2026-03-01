import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

export interface CardProps {
  title?: string | React.ReactElement;
  children?: React.ReactElement;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
}

const Card: React.FC<CardProps> = ({ title, style, headerStyle, children }) => (
  <View style={[styles.container, style]}>
    {title !== undefined && (
      <View style={[styles.header, headerStyle]}>
        {typeof title === 'string' ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          title
        )}
      </View>
    )}
    {children !== undefined && (
      <View style={styles.body}>{children}</View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizeLg,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});

export default Card;
