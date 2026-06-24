import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { VoteSignalsFootnote, VoteSignalsHeader } from './VoteSignalsHeader';

describe('VoteSignalsHeader', () => {
  it('renders "Pre-voting feedback" by default', () => {
    const { container } = render(<VoteSignalsHeader />);
    expect(container.textContent).toContain('Pre-voting feedback');
  });

  it('renders "Pre-proposal feedback" when isCandidate=true', () => {
    const { container } = render(<VoteSignalsHeader isCandidate={true} />);
    expect(container.textContent).toContain('Pre-proposal feedback');
  });

  it('hides description paragraph when isCandidate=true', () => {
    const { container } = render(<VoteSignalsHeader isCandidate={true} />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('shows description paragraph when isCandidate=false', () => {
    const { container } = render(<VoteSignalsHeader isCandidate={false} />);
    expect(container.querySelector('p')).not.toBeNull();
    expect(container.querySelector('p')?.textContent).toContain('Nijis voters');
  });

  it('uses text-xl class when isCandidate=true (h2)', () => {
    const { container } = render(<VoteSignalsHeader isCandidate={true} />);
    expect(container.querySelector('h2')?.className).toContain('text-xl');
  });

  it('does not have text-xl when isCandidate=false', () => {
    const { container } = render(<VoteSignalsHeader isCandidate={false} />);
    expect(container.querySelector('h2')?.className).not.toContain('text-xl');
  });
});

describe('VoteSignalsFootnote', () => {
  it('renders explanatory paragraph', () => {
    const { container } = render(<VoteSignalsFootnote />);
    expect(container.querySelector('p')?.textContent).toContain('Nijis voters');
  });

  it('renders exactly 1 p element', () => {
    const { container } = render(<VoteSignalsFootnote />);
    expect(container.querySelectorAll('p').length).toBe(1);
  });
});

describe('VoteSignalsHeader — additional', () => {
  it('renders exactly 1 h2 element', () => {
    const { container } = render(<VoteSignalsHeader />);
    expect(container.querySelectorAll('h2').length).toBe(1);
  });

  it('isCandidate=true text-xl is verbatim class match', () => {
    const { container } = render(<VoteSignalsHeader isCandidate={true} />);
    const cls = container.querySelector('h2')?.className ?? '';
    expect(cls.split(/\s+/).includes('text-xl')).toBe(true);
  });

  it('isCandidate undefined defaults to non-candidate (Pre-voting feedback)', () => {
    const { container } = render(<VoteSignalsHeader />);
    expect(container.textContent).toContain('Pre-voting feedback');
    expect(container.querySelector('p')).not.toBeNull();
  });

  it('isCandidate=true hides description paragraph entirely', () => {
    const { container } = render(<VoteSignalsHeader isCandidate={true} />);
    expect(container.querySelectorAll('p').length).toBe(0);
  });

  it('description paragraph contains "Nijis voters" when isCandidate=false', () => {
    const { container } = render(<VoteSignalsHeader isCandidate={false} />);
    expect(container.querySelector('p')?.textContent).toContain('Nijis voters');
  });
});
