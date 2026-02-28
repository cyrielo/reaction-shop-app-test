export const typography = {
  sizeSm: 12,
  sizeMd: 14,
  sizeLg: 16,
  sizeXl: 20,
  sizeXxl: 24,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightBold: '700' as const,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
} as const;

export type Typography = typeof typography;
export type BorderRadius = typeof borderRadius;
