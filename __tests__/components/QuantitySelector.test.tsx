import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QuantitySelector from '../../src/components/QuantitySelector';

const noop = jest.fn();

afterEach(() => jest.clearAllMocks());

describe('QuantitySelector — rendering', () => {
  it('displays the current value', () => {
    const { getByText } = render(
      <QuantitySelector value={3} onIncrease={noop} onDecrease={noop} productTitle="Shirt" />,
    );
    expect(getByText('3')).toBeTruthy();
  });

  it('renders decrease and increase buttons', () => {
    const { getAllByRole } = render(
      <QuantitySelector value={2} onIncrease={noop} onDecrease={noop} productTitle="Shirt" />,
    );
    expect(getAllByRole('button')).toHaveLength(2);
  });
});

describe('QuantitySelector — accessibility', () => {
  it('decrease button has correct accessibilityLabel', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={2} onIncrease={noop} onDecrease={noop} productTitle="Blue Hoodie" />,
    );
    expect(getByLabelText('Decrease quantity of Blue Hoodie')).toBeTruthy();
  });

  it('increase button has correct accessibilityLabel', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={2} onIncrease={noop} onDecrease={noop} productTitle="Blue Hoodie" />,
    );
    expect(getByLabelText('Increase quantity of Blue Hoodie')).toBeTruthy();
  });

  it('value text has accessibilityLabel "Quantity: N"', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={4} onIncrease={noop} onDecrease={noop} productTitle="Cap" />,
    );
    expect(getByLabelText('Quantity: 4')).toBeTruthy();
  });

  it('decrease button is disabled at min value (default min=1)', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={1} onIncrease={noop} onDecrease={noop} productTitle="Shirt" />,
    );
    expect(getByLabelText('Decrease quantity of Shirt').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('decrease button is enabled above min', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={2} onIncrease={noop} onDecrease={noop} productTitle="Shirt" />,
    );
    expect(getByLabelText('Decrease quantity of Shirt').props.accessibilityState).toMatchObject({ disabled: false });
  });

  it('increase button is disabled at max value', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={5} onIncrease={noop} onDecrease={noop} productTitle="Shirt" max={5} />,
    );
    expect(getByLabelText('Increase quantity of Shirt').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('increase button is enabled below max', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={3} onIncrease={noop} onDecrease={noop} productTitle="Shirt" max={5} />,
    );
    expect(getByLabelText('Increase quantity of Shirt').props.accessibilityState).toMatchObject({ disabled: false });
  });

  it('increase button is enabled when no max is set', () => {
    const { getByLabelText } = render(
      <QuantitySelector value={99} onIncrease={noop} onDecrease={noop} productTitle="Shirt" />,
    );
    expect(getByLabelText('Increase quantity of Shirt').props.accessibilityState).toMatchObject({ disabled: false });
  });
});

describe('QuantitySelector — interactions', () => {
  it('calls onIncrease when increase button is pressed', () => {
    const onIncrease = jest.fn();
    const { getByLabelText } = render(
      <QuantitySelector value={2} onIncrease={onIncrease} onDecrease={noop} productTitle="Pants" />,
    );
    fireEvent.press(getByLabelText('Increase quantity of Pants'));
    expect(onIncrease).toHaveBeenCalledTimes(1);
  });

  it('calls onDecrease when decrease button is pressed', () => {
    const onDecrease = jest.fn();
    const { getByLabelText } = render(
      <QuantitySelector value={2} onIncrease={noop} onDecrease={onDecrease} productTitle="Pants" />,
    );
    fireEvent.press(getByLabelText('Decrease quantity of Pants'));
    expect(onDecrease).toHaveBeenCalledTimes(1);
  });

  it('does not call onDecrease when at min', () => {
    const onDecrease = jest.fn();
    const { getByLabelText } = render(
      <QuantitySelector value={1} onIncrease={noop} onDecrease={onDecrease} productTitle="Pants" />,
    );
    fireEvent.press(getByLabelText('Decrease quantity of Pants'));
    expect(onDecrease).not.toHaveBeenCalled();
  });

  it('does not call onIncrease when at max', () => {
    const onIncrease = jest.fn();
    const { getByLabelText } = render(
      <QuantitySelector value={5} onIncrease={onIncrease} onDecrease={noop} productTitle="Pants" max={5} />,
    );
    fireEvent.press(getByLabelText('Increase quantity of Pants'));
    expect(onIncrease).not.toHaveBeenCalled();
  });

  it('respects a custom min value', () => {
    const onDecrease = jest.fn();
    const { getByLabelText } = render(
      <QuantitySelector value={2} onIncrease={noop} onDecrease={onDecrease} productTitle="Pants" min={2} />,
    );
    fireEvent.press(getByLabelText('Decrease quantity of Pants'));
    expect(onDecrease).not.toHaveBeenCalled();
  });
});
