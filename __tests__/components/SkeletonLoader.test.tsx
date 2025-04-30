import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from '../../components/SkeletonLoader/SkeletonLoader';

// Mock the Skeleton component to inspect props
vi.mock('@navikt/ds-react/Skeleton', () => ({
  Skeleton: (props: any) => <div data-testid='skeleton' {...props} />
}));

describe('SkeletonLoader', () => {
  it('renders the provided tekst when laster is true', () => {
    render(<SkeletonLoader ferdigLastet={true} tekst='Laster innhold...' />);
    expect(screen.getByText('Laster innhold...')).toBeInTheDocument();
    expect(screen.queryByTestId('skeleton')).toBeNull();
  });

  it('renders Skeleton when laster is false', () => {
    render(<SkeletonLoader ferdigLastet={false} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('variant', 'text');
    expect(skeleton).toHaveAttribute('width', '90%');
    expect(skeleton).toHaveAttribute('height', '28');
  });

  it('renders nothing when laster is true and no tekst is provided', () => {
    const { container } = render(<SkeletonLoader ferdigLastet={true} />);
    expect(container).toBeEmptyDOMElement();
  });
});
