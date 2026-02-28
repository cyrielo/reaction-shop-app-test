import type { Money } from '../types';

export function formatCurrency(money: Money): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
