import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmptyState from '../../src/components/EmptyState';

afterEach(() => jest.clearAllMocks());

describe('EmptyState — rendering', () => {
  it('renders the title', () => {
    const { getByText } = render(<EmptyState title="Nothing here" message="Your cart is empty." />);
    expect(getByText('Nothing here')).toBeTruthy();
  });

  it('renders the message', () => {
    const { getByText } = render(<EmptyState title="Nothing here" message="Your cart is empty." />);
    expect(getByText('Your cart is empty.')).toBeTruthy();
  });

  it('does not render action button when actionLabel is not provided', () => {
    const { queryByRole } = render(<EmptyState title="Empty" message="Nothing to show." />);
    expect(queryByRole('button')).toBeNull();
  });

  it('does not render action button when onAction is not provided', () => {
    const { queryByRole } = render(
      <EmptyState title="Empty" message="Nothing to show." actionLabel="Shop now" />,
    );
    expect(queryByRole('button')).toBeNull();
  });

  it('renders action button when both actionLabel and onAction are provided', () => {
    const { getByRole } = render(
      <EmptyState title="Empty" message="Nothing." actionLabel="Browse" onAction={jest.fn()} />,
    );
    expect(getByRole('button')).toBeTruthy();
  });

  it('renders action button with the correct label', () => {
    const { getByText } = render(
      <EmptyState title="Empty" message="Nothing." actionLabel="Shop now" onAction={jest.fn()} />,
    );
    expect(getByText('Shop now')).toBeTruthy();
  });
});

describe('EmptyState — accessibility', () => {
  it('title has accessibilityRole="header"', () => {
    const { getByRole } = render(<EmptyState title="Cart is empty" message="Add some items." />);
    expect(getByRole('header')).toBeTruthy();
  });

  it('header role element contains the title text', () => {
    const { getByRole } = render(<EmptyState title="No products" message="Check back later." />);
    expect(getByRole('header').props.children).toBe('No products');
  });

  it('action button has accessibilityLabel matching actionLabel', () => {
    const { getByLabelText } = render(
      <EmptyState title="Empty" message="Nothing." actionLabel="Start shopping" onAction={jest.fn()} />,
    );
    expect(getByLabelText('Start shopping')).toBeTruthy();
  });
});

describe('EmptyState — interactions', () => {
  it('calls onAction when the action button is pressed', () => {
    const onAction = jest.fn();
    const { getByRole } = render(
      <EmptyState title="Empty" message="Nothing." actionLabel="Retry" onAction={onAction} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
