export const colors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  primary: '#008060',
  text: '#1A1A1A',
  textSecondary: '#6B7177',
  error: '#D72C0D',
  border: '#E1E3E5',
  disabled: '#BABFC3',
} as const;

export type Colors = typeof colors;
