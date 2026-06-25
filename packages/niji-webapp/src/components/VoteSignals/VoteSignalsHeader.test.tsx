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

  it('header always renders h2 element regardless of isCandidate', () => {
    const { container: c1 } = render(<VoteSignalsHeader isCandidate={true} />);
    const { container: c2 } = render(<VoteSignalsHeader isCandidate={false} />);
    expect(c1.querySelector('h2')).not.toBeNull();
    expect(c2.querySelector('h2')).not.toBeNull();
  });

  it('VoteSignalsFootnote renders single p element with content', () => {
    const { container } = render(<VoteSignalsFootnote />);
    expect(container.querySelector('p')).not.toBeNull();
    expect((container.querySelector('p')?.textContent ?? '').length).toBeGreaterThan(0);
  });

  it('Footnote includes governance context word', () => {
    const { container } = render(<VoteSignalsFootnote />);
    expect(container.textContent).toContain('Nijis');
  });

  it('isCandidate=false header text is "Pre-voting feedback" not "proposal"', () => {
    const { container } = render(<VoteSignalsHeader isCandidate={false} />);
    expect(container.textContent).toContain('Pre-voting feedback');
    expect(container.textContent).not.toContain('Pre-proposal feedback');
  });

  it('VoteSignalsHeader mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<VoteSignalsHeader />);
      unmount();
    }
  });

  it('VoteSignalsHeader renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <VoteSignalsHeader key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 isCandidate toggle cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<VoteSignalsHeader isCandidate={i % 2 === 0} />);
      unmount();
    }
  });

  it('VoteSignalsFootnote mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<VoteSignalsFootnote />);
      unmount();
    }
  });

  it('VoteSignalsFootnote renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <VoteSignalsFootnote key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 VoteSignalsHeader mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<VoteSignalsHeader />);
      unmount();
    }
  });

  it('round-2 VoteSignalsHeader renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <VoteSignalsHeader key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 isCandidate toggle cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<VoteSignalsHeader isCandidate={i % 2 === 0} />);
      unmount();
    }
  });

  it('round-2 VoteSignalsFootnote mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<VoteSignalsFootnote />);
      unmount();
    }
  });

  it('round-2 VoteSignalsFootnote renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <VoteSignalsFootnote key={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });
});
