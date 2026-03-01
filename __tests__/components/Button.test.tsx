import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../src/components/Button';

const noop = jest.fn();

afterEach(() => jest.clearAllMocks());

describe('Button — rendering', () => {
  it('renders the label text', () => {
    const { getByText } = render(
      <Button label="Add to cart" onPress={noop} variant="primary" accessibilityLabel="Add to cart" />,
    );
    expect(getByText('Add to cart')).toBeTruthy();
  });

  it('shows ActivityIndicator and hides label when loading', () => {
    const { queryByText, getByTestId } = render(
      <Button label="Save" onPress={noop} variant="primary" accessibilityLabel="Save" loading />,
    );
    // Label text should not be present while loading
    expect(queryByText('Save')).toBeNull();
    // ActivityIndicator is rendered (react-native preset exposes it by displayName)
    const { UNSAFE_getByType } = render(
      <Button label="Save" onPress={noop} variant="primary" accessibilityLabel="Save" loading />,
    );
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });
});

describe('Button — accessibility', () => {
  it('has accessibilityRole="button"', () => {
    const { getByRole } = render(
      <Button label="Submit" onPress={noop} variant="primary" accessibilityLabel="Submit form" />,
    );
    expect(getByRole('button')).toBeTruthy();
  });

  it('exposes the accessibilityLabel', () => {
    const { getByLabelText } = render(
      <Button label="Go" onPress={noop} variant="secondary" accessibilityLabel="Navigate to cart" />,
    );
    expect(getByLabelText('Navigate to cart')).toBeTruthy();
  });

  it('sets accessibilityState disabled=true when disabled prop is true', () => {
    const { getByRole } = render(
      <Button label="Buy" onPress={noop} variant="primary" accessibilityLabel="Buy now" disabled />,
    );
    expect(getByRole('button').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('sets accessibilityState disabled=false when enabled', () => {
    const { getByRole } = render(
      <Button label="Buy" onPress={noop} variant="primary" accessibilityLabel="Buy now" />,
    );
    expect(getByRole('button').props.accessibilityState).toMatchObject({ disabled: false });
  });

  it('sets accessibilityState busy=true when loading', () => {
    const { getByRole } = render(
      <Button label="Saving" onPress={noop} variant="primary" accessibilityLabel="Saving" loading />,
    );
    expect(getByRole('button').props.accessibilityState).toMatchObject({ busy: true });
  });

  it('sets accessibilityState busy=false when not loading', () => {
    const { getByRole } = render(
      <Button label="Save" onPress={noop} variant="primary" accessibilityLabel="Save" />,
    );
    expect(getByRole('button').props.accessibilityState).toMatchObject({ busy: false });
  });
});

describe('Button — interactions', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button label="Tap me" onPress={onPress} variant="primary" accessibilityLabel="Tap me" />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button label="Tap me" onPress={onPress} variant="primary" accessibilityLabel="Tap me" disabled />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button label="Tap me" onPress={onPress} variant="primary" accessibilityLabel="Tap me" loading />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
