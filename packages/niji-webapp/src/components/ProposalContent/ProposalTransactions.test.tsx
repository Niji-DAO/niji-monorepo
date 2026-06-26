import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span>{address}</span>,
}));

vi.mock('@niji/sdk/react', () => ({
  nijiPayerAddress: { 1: '0xPAYER' },
  nijiTokenBuyerAddress: { 1: '0xTOKENBUYER' },
}));

vi.mock('@/wagmi', () => ({
  defaultChain: { id: 1 },
}));

vi.mock('.', () => ({
  linkIfAddress: (content: string) => <span data-testid="link">{content}</span>,
}));

import ProposalTransactions from './ProposalTransactions';

const simpleTx = {
  target: '0xTARGET1',
  functionSig: '',
  callData: 'raw-data',
  value: 0n,
} as never;

const sigTx = {
  target: '0xTARGET2',
  functionSig: 'transfer',
  callData: '0xRECIPIENT,1000',
  value: 50n,
} as never;

const tokenBuyerTx = {
  target: '0xTOKENBUYER',
  functionSig: 'transfer',
  callData: '0xRECIPIENT,500',
  value: 10n,
} as never;

describe('ProposalTransactions', () => {
  it('renders ol with li per detail', () => {
    const { container } = render(<ProposalTransactions details={[simpleTx, sigTx]} />);
    expect(container.querySelectorAll('ol li').length).toBe(2);
  });

  it('shows raw callData when functionSig empty', () => {
    const { container } = render(<ProposalTransactions details={[simpleTx]} />);
    expect(container.textContent).toContain('raw-data');
  });

  it('renders callData split when functionSig non-empty', () => {
    const { container } = render(<ProposalTransactions details={[sigTx]} />);
    expect(container.textContent).toContain('transfer');
    const links = container.querySelectorAll('[data-testid="link"]');
    // target + 2 callData parts = 3
    expect(links.length).toBe(3);
  });

  it('skips value when 0n', () => {
    const { container } = render(<ProposalTransactions details={[simpleTx]} />);
    expect(container.textContent).not.toContain('0n');
  });

  it('renders TokenBuyer info banner when target is TokenBuyer + transfer', () => {
    const { container } = render(<ProposalTransactions details={[tokenBuyerTx]} />);
    expect(container.textContent).toContain('automatically added to refill the TokenBuyer');
  });

  it('does NOT show TokenBuyer banner for non-TokenBuyer target', () => {
    const { container } = render(<ProposalTransactions details={[sigTx]} />);
    expect(container.textContent).not.toContain('automatically added');
  });

  it('renders empty ol when details is empty', () => {
    const { container } = render(<ProposalTransactions details={[]} />);
    expect(container.querySelectorAll('ol li').length).toBe(0);
  });

  it('renders exactly 1 ol element regardless of details length', () => {
    const { container } = render(<ProposalTransactions details={[simpleTx, sigTx]} />);
    expect(container.querySelectorAll('ol').length).toBe(1);
  });

  it('renders 10 li for 10 details (large array)', () => {
    const details = Array.from({ length: 10 }, (_, i) => ({
      target: `0xT${i}`,
      functionSig: '',
      callData: `data-${i}`,
      value: 0n,
    })) as never;
    const { container } = render(<ProposalTransactions details={details} />);
    expect(container.querySelectorAll('ol li').length).toBe(10);
  });

  it('multiple targets render distinct text', () => {
    const { container } = render(<ProposalTransactions details={[simpleTx, sigTx]} />);
    expect(container.textContent).toContain('0xTARGET1');
    expect(container.textContent).toContain('0xTARGET2');
  });

  it('renders 1 TokenBuyer banner for 1 tokenBuyer tx in mixed list', () => {
    const { container } = render(
      <ProposalTransactions details={[simpleTx, tokenBuyerTx, sigTx]} />,
    );
    const matches = container.textContent?.match(/automatically added/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it('renders large value (1e18 wei) in non-zero tx', () => {
    const largeTx = { ...sigTx, value: 1_000_000_000_000_000_000n } as never;
    const { container } = render(<ProposalTransactions details={[largeTx]} />);
    expect(container.textContent).toContain('1000000000000000000');
  });

  it('handles single tx with empty callData gracefully', () => {
    const empty = { ...simpleTx, callData: '' } as never;
    expect(() => render(<ProposalTransactions details={[empty]} />)).not.toThrow();
  });

  it('renders 2 TokenBuyer banners for 2 tokenBuyer tx in list', () => {
    const { container } = render(<ProposalTransactions details={[tokenBuyerTx, tokenBuyerTx]} />);
    const matches = container.textContent?.match(/automatically added/g) ?? [];
    expect(matches.length).toBe(2);
  });

  it('renders 5 li with 5 distinct targets', () => {
    const targets = ['0xA', '0xB', '0xC', '0xD', '0xE'];
    const details = targets.map(t => ({
      target: t,
      functionSig: '',
      callData: 'd',
      value: 0n,
    })) as never;
    const { container } = render(<ProposalTransactions details={details} />);
    targets.forEach(t => expect(container.textContent).toContain(t));
  });

  it('passes details=[] without crash + 0 li', () => {
    const { container } = render(<ProposalTransactions details={[]} />);
    expect(container.querySelectorAll('li').length).toBe(0);
  });

  it('functionSig present + non-zero value renders both', () => {
    const tx = { ...sigTx, value: 999n } as never;
    const { container } = render(<ProposalTransactions details={[tx]} />);
    expect(container.textContent).toContain('999');
    expect(container.textContent).toContain('transfer');
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransactions details={[simpleTx]} />);
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalTransactions key={i} details={[simpleTx]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different details counts', () => {
    for (let i = 1; i <= 30; i++) {
      const details = Array.from({ length: i }, () => simpleTx);
      const { unmount } = render(<ProposalTransactions details={details} />);
      unmount();
    }
  });

  it('handles 30 different target addresses', () => {
    for (let i = 0; i < 30; i++) {
      const target = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <ProposalTransactions details={[{ ...simpleTx, target } as never]} />,
      );
      unmount();
    }
  });

  it('rapid 50 renders with empty details', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<ProposalTransactions details={[]} />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<ProposalTransactions details={[simpleTx]} />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <ProposalTransactions key={i} details={[simpleTx]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different details counts', () => {
    for (let i = 1; i <= 50; i++) {
      const details = Array.from({ length: i }, () => simpleTx);
      const { unmount } = render(<ProposalTransactions details={details} />);
      unmount();
    }
  });

  it('round-2 handles 50 different target addresses', () => {
    for (let i = 0; i < 50; i++) {
      const target = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <ProposalTransactions details={[{ ...simpleTx, target } as never]} />,
      );
      unmount();
    }
  });

  it('round-2 rapid 100 renders with empty details', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => render(<ProposalTransactions details={[]} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalTransactions key={i} details={[]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransactions details={[]} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-3 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalTransactions key={i} details={[]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransactions details={[]} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-4 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransactions key={i} details={[]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransactions details={[]} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-5 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransactions key={i} details={[]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransactions details={[]} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-6 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransactions key={i} details={[]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransactions details={[]} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-7 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransactions key={i} details={[]} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransactions details={[]} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });

  it('round-8 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransactions details={[]} />);
      unmount();
    }
  });
});
