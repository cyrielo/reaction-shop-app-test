import React from 'react';
import { render } from '@testing-library/react-native';
import PriceDisplay from '../../src/components/PriceDisplay';
import type { Money } from '../../src/types';

const cad = (amount: string): Money => ({ amount, currencyCode: 'CAD' });

describe('PriceDisplay — rendering', () => {
  it('renders the formatted price', () => {
    const { getByText } = render(<PriceDisplay price={cad('24.99')} size="md" />);
    expect(getByText('CA$24.99')).toBeTruthy();
  });

  it('does not render compareAtPrice when not provided', () => {
    const { queryByText } = render(<PriceDisplay price={cad('24.99')} size="md" />);
    // Only one price text should exist
    expect(queryByText('CA$24.99')).toBeTruthy();
  });

  it('renders compareAtPrice when it is higher than price', () => {
    const { getByText } = render(
      <PriceDisplay price={cad('24.99')} compareAtPrice={cad('49.99')} size="md" />,
    );
    expect(getByText('CA$24.99')).toBeTruthy();
    expect(getByText('CA$49.99')).toBeTruthy();
  });

  it('does not render compareAtPrice when it equals price (no discount)', () => {
    const { queryByText } = render(
      <PriceDisplay price={cad('24.99')} compareAtPrice={cad('24.99')} size="md" />,
    );
    // compareAt should be absent — only one price rendered
    const priceEls = queryByText('CA$24.99');
    expect(priceEls).toBeTruthy();
    // The strikethrough text should not appear
    const { getAllByText } = render(
      <PriceDisplay price={cad('24.99')} compareAtPrice={cad('24.99')} size="md" />,
    );
    expect(getAllByText('CA$24.99')).toHaveLength(1);
  });

  it('does not render compareAtPrice when it is lower than price', () => {
    const { getAllByText } = render(
      <PriceDisplay price={cad('49.99')} compareAtPrice={cad('24.99')} size="md" />,
    );
    expect(getAllByText(/CA\$/).length).toBe(1);
  });

  it('renders with size sm without crashing', () => {
    expect(() => render(<PriceDisplay price={cad('10.00')} size="sm" />)).not.toThrow();
  });

  it('renders with size lg without crashing', () => {
    expect(() => render(<PriceDisplay price={cad('10.00')} size="lg" />)).not.toThrow();
  });
});

describe('PriceDisplay — accessibility', () => {
  it('has a composite accessibilityLabel with just the price when no discount', () => {
    const { getByLabelText } = render(<PriceDisplay price={cad('24.99')} size="md" />);
    expect(getByLabelText('CA$24.99')).toBeTruthy();
  });

  it('has a composite accessibilityLabel including "was" when discounted', () => {
    const { getByLabelText } = render(
      <PriceDisplay price={cad('24.99')} compareAtPrice={cad('49.99')} size="md" />,
    );
    expect(getByLabelText('CA$24.99, was CA$49.99')).toBeTruthy();
  });

  it('accessibilityLabel does not include "was" when compareAtPrice equals price', () => {
    const { getByLabelText } = render(
      <PriceDisplay price={cad('24.99')} compareAtPrice={cad('24.99')} size="md" />,
    );
    expect(getByLabelText('CA$24.99')).toBeTruthy();
  });
});
