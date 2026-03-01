import React from 'react';
import { render } from '@testing-library/react-native';
import SkeletonLoader from '../../src/components/SkeletonLoader';

// The outer View has importantForAccessibility and accessibilityRole as direct
// props, while width/height live inside the style object. Locate by a11y props.
function getContainer(renderResult: ReturnType<typeof render>) {
  return renderResult.UNSAFE_getByProps({ importantForAccessibility: 'no', accessibilityRole: 'none' });
}

describe('SkeletonLoader — rendering', () => {
  it('renders without crashing with numeric width and height', () => {
    expect(() => render(<SkeletonLoader width={200} height={20} />)).not.toThrow();
  });

  it('renders without crashing with percentage width', () => {
    expect(() => render(<SkeletonLoader width="100%" height={16} />)).not.toThrow();
  });

  it('applies the provided width to the container style', () => {
    const result = render(<SkeletonLoader width={150} height={24} />);
    expect(getContainer(result).props.style.width).toBe(150);
  });

  it('applies the provided height to the container style', () => {
    const result = render(<SkeletonLoader width={100} height={40} />);
    expect(getContainer(result).props.style.height).toBe(40);
  });

  it('applies a custom borderRadius to the container style', () => {
    const result = render(<SkeletonLoader width={80} height={80} borderRadius={40} />);
    expect(getContainer(result).props.style.borderRadius).toBe(40);
  });
});

describe('SkeletonLoader — accessibility', () => {
  it('is hidden from the accessibility tree (importantForAccessibility="no")', () => {
    const result = render(<SkeletonLoader width={100} height={20} />);
    expect(getContainer(result).props.importantForAccessibility).toBe('no');
  });

  it('has accessibilityRole="none"', () => {
    const result = render(<SkeletonLoader width={100} height={20} />);
    expect(getContainer(result).props.accessibilityRole).toBe('none');
  });
});
