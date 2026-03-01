import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import VariantSelector from '../../../src/features/product/VariantSelector';
import type { ProductOption, ProductVariant, SelectedOption } from '../../../src/types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeVariant(
  overrides: Partial<ProductVariant> & { selectedOptions: SelectedOption[] },
): ProductVariant {
  return {
    id: `variant-${overrides.selectedOptions.map(o => o.value).join('-')}`,
    title: overrides.selectedOptions.map(o => o.value).join(' / '),
    quantityAvailable: 10,
    availableForSale: true,
    currentlyNotInStock: false,
    price: { amount: '29.99', currencyCode: 'CAD' },
    compareAtPrice: null,
    sku: 'SKU',
    image: null,
    product: { id: 'prod-1', handle: 'test', options: [] },
    ...overrides,
  };
}

// Single-option scenario: Size (S, M, L) — all available
const sizeOption: ProductOption = { id: 'opt-size', name: 'Size', values: ['S', 'M', 'L'] };
const sizeVariants: ProductVariant[] = [
  makeVariant({ selectedOptions: [{ name: 'Size', value: 'S' }] }),
  makeVariant({ selectedOptions: [{ name: 'Size', value: 'M' }] }),
  makeVariant({ selectedOptions: [{ name: 'Size', value: 'L' }], availableForSale: false }),
];

// Two-option scenario: Size (S, M) × Color (Red, Blue)
// Available: S/Red, S/Blue, M/Red — M/Blue is unavailable
const colorOption: ProductOption = { id: 'opt-color', name: 'Color', values: ['Red', 'Blue'] };
const twoOptionVariants: ProductVariant[] = [
  makeVariant({ selectedOptions: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Red' }] }),
  makeVariant({ selectedOptions: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Blue' }] }),
  makeVariant({ selectedOptions: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Red' }] }),
  makeVariant({ selectedOptions: [{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Blue' }], availableForSale: false }),
];

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('VariantSelector — rendering', () => {
  it('renders the option group name', () => {
    const { getByText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByText('Size')).toBeTruthy();
  });

  it('renders a chip for each option value', () => {
    const { getByText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByText('S')).toBeTruthy();
    expect(getByText('M')).toBeTruthy();
    expect(getByText('L')).toBeTruthy();
  });

  it('renders multiple option groups', () => {
    const { getByText } = render(
      <VariantSelector
        options={[sizeOption, colorOption]}
        variants={twoOptionVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Red' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByText('Size')).toBeTruthy();
    expect(getByText('Color')).toBeTruthy();
  });

  it('renders no groups when options array is empty', () => {
    const { queryByRole } = render(
      <VariantSelector options={[]} variants={[]} selectedOptions={[]} onSelect={jest.fn()} />,
    );
    expect(queryByRole('button')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('VariantSelector — accessibility', () => {
  it('each chip has accessibilityRole="button"', () => {
    const { getAllByRole } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getAllByRole('button')).toHaveLength(3);
  });

  it('available chip accessibilityLabel is "OptionName: value"', () => {
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Size: S')).toBeTruthy();
    expect(getByLabelText('Size: M')).toBeTruthy();
  });

  it('unavailable chip accessibilityLabel includes ", unavailable"', () => {
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Size: L, unavailable')).toBeTruthy();
  });

  it('selected chip has accessibilityState.selected=true', () => {
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Size: S').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('non-selected chip has accessibilityState.selected=false', () => {
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Size: M').props.accessibilityState).toMatchObject({ selected: false });
  });

  it('unavailable chip has accessibilityState.disabled=true', () => {
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Size: L, unavailable').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('available chip has accessibilityState.disabled=false', () => {
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Size: M').props.accessibilityState).toMatchObject({ disabled: false });
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

describe('VariantSelector — interactions', () => {
  it('calls onSelect with option name and value when an available chip is pressed', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByLabelText('Size: M'));
    expect(onSelect).toHaveBeenCalledWith('Size', 'M');
  });

  it('does not call onSelect when an unavailable chip is pressed', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByLabelText('Size: L, unavailable'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('calls onSelect when pressing the currently-selected chip', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={sizeVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByLabelText('Size: S'));
    expect(onSelect).toHaveBeenCalledWith('Size', 'S');
  });
});

// ---------------------------------------------------------------------------
// Availability logic (isOptionValueAvailable) — via two-option fixture
// ---------------------------------------------------------------------------

describe('VariantSelector — availability logic', () => {
  // When Size=M is selected, Color=Blue has no availableForSale variant → unavailable
  it('marks a value unavailable when the combined variant is not availableForSale', () => {
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption, colorOption]}
        variants={twoOptionVariants}
        selectedOptions={[{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Red' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Color: Blue, unavailable')).toBeTruthy();
  });

  // When Size=S is selected, both Red and Blue are available
  it('marks a value available when at least one matching variant is availableForSale', () => {
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption, colorOption]}
        variants={twoOptionVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Red' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Color: Red')).toBeTruthy();
    expect(getByLabelText('Color: Blue')).toBeTruthy();
  });

  it('marks all values unavailable when no variants are availableForSale', () => {
    const noStockVariants = sizeVariants.map(v => ({ ...v, availableForSale: false }));
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={noStockVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Size: S, unavailable')).toBeTruthy();
    expect(getByLabelText('Size: M, unavailable')).toBeTruthy();
    expect(getByLabelText('Size: L, unavailable')).toBeTruthy();
  });

  it('marks all values available when all variants are availableForSale', () => {
    const allStockVariants = sizeVariants.map(v => ({ ...v, availableForSale: true }));
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption]}
        variants={allStockVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }]}
        onSelect={jest.fn()}
      />,
    );
    expect(getByLabelText('Size: S')).toBeTruthy();
    expect(getByLabelText('Size: M')).toBeTruthy();
    expect(getByLabelText('Size: L')).toBeTruthy();
  });

  it('does not allow pressing M/Blue which has no in-stock variant', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(
      <VariantSelector
        options={[sizeOption, colorOption]}
        variants={twoOptionVariants}
        selectedOptions={[{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Red' }]}
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByLabelText('Color: Blue, unavailable'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('re-evaluates availability correctly when selection changes', () => {
    const onSelect = jest.fn();
    // Start with S selected — Blue should be available
    const { getByLabelText, rerender } = render(
      <VariantSelector
        options={[sizeOption, colorOption]}
        variants={twoOptionVariants}
        selectedOptions={[{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Red' }]}
        onSelect={onSelect}
      />,
    );
    expect(getByLabelText('Color: Blue')).toBeTruthy();

    // Switch selection to M — Blue should now be unavailable
    rerender(
      <VariantSelector
        options={[sizeOption, colorOption]}
        variants={twoOptionVariants}
        selectedOptions={[{ name: 'Size', value: 'M' }, { name: 'Color', value: 'Red' }]}
        onSelect={onSelect}
      />,
    );
    expect(getByLabelText('Color: Blue, unavailable')).toBeTruthy();
  });
});
