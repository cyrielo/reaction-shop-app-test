import React from 'react';
import { render } from '@testing-library/react-native';
import Badge from '../../src/components/Badge';

describe('Badge — rendering', () => {
  it('renders the label text', () => {
    const { getByText } = render(<Badge label="In Stock" variant="success" />);
    expect(getByText('In Stock')).toBeTruthy();
  });

  it('renders with each variant without crashing', () => {
    const variants: Array<'success' | 'warning' | 'error' | 'neutral'> = [
      'success', 'warning', 'error', 'neutral',
    ];
    variants.forEach(variant => {
      expect(() => render(<Badge label="test" variant={variant} />)).not.toThrow();
    });
  });
});

describe('Badge — accessibility', () => {
  it('exposes the label as accessibilityLabel', () => {
    const { getByLabelText } = render(<Badge label="Out of Stock" variant="error" />);
    expect(getByLabelText('Out of Stock')).toBeTruthy();
  });

  it('accessibilityLabel on the container matches the label prop', () => {
    const { getByLabelText } = render(<Badge label="New Arrival" variant="neutral" />);
    expect(getByLabelText('New Arrival').props.accessibilityLabel).toBe('New Arrival');
  });

  it('container has accessibilityRole="text"', () => {
    const { getByLabelText } = render(<Badge label="On Sale" variant="success" />);
    expect(getByLabelText('On Sale').props.accessibilityRole).toBe('text');
  });

  it('is accessible (accessible=true on container)', () => {
    const { getByLabelText } = render(<Badge label="On Sale" variant="success" />);
    expect(getByLabelText('On Sale').props.accessible).toBe(true);
  });
});
