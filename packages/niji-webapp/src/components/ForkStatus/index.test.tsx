import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { ForkState } from '@/wrappers/nijiDao';

import ForkStatus from './index';

describe('ForkStatus', () => {
  it('renders "In Escrow" for ESCROW status', () => {
    const { container } = render(<ForkStatus status={ForkState.ESCROW} />);
    expect(container.textContent).toBe('In Escrow');
  });

  it('renders "Forking" for ACTIVE status', () => {
    const { container } = render(<ForkStatus status={ForkState.ACTIVE} />);
    expect(container.textContent).toBe('Forking');
  });

  it('renders "Executed" for EXECUTED status', () => {
    const { container } = render(<ForkStatus status={ForkState.EXECUTED} />);
    expect(container.textContent).toBe('Executed');
  });

  it('renders "Undetermined" for undefined status (default branch)', () => {
    const { container } = render(<ForkStatus />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('renders "Undetermined" for UNDETERMINED enum value', () => {
    const { container } = render(<ForkStatus status={ForkState.UNDETERMINED} />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('merges custom className', () => {
    const { container } = render(<ForkStatus status={ForkState.ACTIVE} className="extra" />);
    expect(container.querySelector('div')?.className).toContain('extra');
  });
});
