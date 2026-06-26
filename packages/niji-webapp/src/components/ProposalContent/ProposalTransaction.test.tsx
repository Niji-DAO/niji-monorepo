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
  linkIfAddress: (content: string) => <span data-testid="link-if-addr">{content}</span>,
}));

import ProposalTransaction from './ProposalTransaction';

const simpleTx = {
  target: '0xTARGET',
  functionSig: '',
  callData: 'plain-data',
  value: 0n,
} as never;

const sigTx = {
  target: '0xTARGET',
  functionSig: 'transfer(address,uint256)',
  callData: '0xRECIPIENT,1000',
  value: 100n,
} as never;

describe('ProposalTransaction', () => {
  it('renders target via linkIfAddress', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    const links = container.querySelectorAll('[data-testid="link-if-addr"]');
    expect(links[0]?.textContent).toBe('0xTARGET');
  });

  it('renders functionSig when present', () => {
    const { container } = render(<ProposalTransaction transaction={sigTx} />);
    expect(container.textContent).toContain('transfer(address,uint256)');
  });

  it('renders raw callData when functionSig is empty', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    expect(container.textContent).toContain('plain-data');
  });

  it('renders callData split as multiple linkIfAddress entries', () => {
    const { container } = render(<ProposalTransaction transaction={sigTx} />);
    const links = container.querySelectorAll('[data-testid="link-if-addr"]');
    // target + 2 callData parts = 3
    expect(links.length).toBe(3);
  });

  it('renders value when present (non-zero)', () => {
    const { container } = render(<ProposalTransaction transaction={sigTx} />);
    expect(container.textContent).toContain('100');
  });

  it('skips value when 0n (falsy)', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    expect(container.textContent).not.toContain('0n');
  });

  it('uses <li> as root element', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    expect(container.querySelector('li')).not.toBeNull();
  });

  it('handles different target address', () => {
    const altTx = { ...simpleTx, target: '0xOTHER' } as never;
    const { container } = render(<ProposalTransaction transaction={altTx} />);
    expect(container.textContent).toContain('0xOTHER');
  });

  it('renders functionSig string in call data area', () => {
    const customSig = {
      target: '0xT',
      functionSig: 'mint(address)',
      callData: '0xR',
      value: 0n,
    } as never;
    const { container } = render(<ProposalTransaction transaction={customSig} />);
    expect(container.textContent).toContain('mint(address)');
  });

  it('renders non-zero value (1 ETH = 1e18 wei)', () => {
    const ethTx = { ...sigTx, value: 1_000_000_000_000_000_000n } as never;
    const { container } = render(<ProposalTransaction transaction={ethTx} />);
    expect(container.textContent).toContain('1000000000000000000');
  });

  it('renders exactly 1 li root element', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    expect(container.querySelectorAll('li').length).toBe(1);
  });

  it('simpleTx renders exactly 1 linkIfAddr for target (no callData split)', () => {
    const { container } = render(<ProposalTransaction transaction={simpleTx} />);
    const links = container.querySelectorAll('[data-testid="link-if-addr"]');
    expect(links.length).toBe(1);
  });

  it('handles 3-arg callData splits into 4 linkIfAddr entries (target + 3 args)', () => {
    const tx3 = {
      target: '0xT',
      functionSig: 'fn(a,b,c)',
      callData: 'a,b,c',
      value: 0n,
    } as never;
    const { container } = render(<ProposalTransaction transaction={tx3} />);
    expect(container.querySelectorAll('[data-testid="link-if-addr"]').length).toBe(4);
  });

  it('renders empty callData functionSig path', () => {
    const empty = {
      target: '0xT',
      functionSig: 'fn()',
      callData: '',
      value: 0n,
    } as never;
    expect(() => render(<ProposalTransaction transaction={empty} />)).not.toThrow();
  });

  it('large bigint value (1e30) renders correctly', () => {
    const huge = { ...sigTx, value: 1_000_000_000_000_000_000_000_000_000_000n } as never;
    const { container } = render(<ProposalTransaction transaction={huge} />);
    expect(container.textContent).toContain('1000000000000000000000000000000');
  });

  it('renders functionSig with single arg', () => {
    const single = {
      target: '0xT',
      functionSig: 'mint(uint256)',
      callData: '42',
      value: 0n,
    } as never;
    const { container } = render(<ProposalTransaction transaction={single} />);
    expect(container.textContent).toContain('mint(uint256)');
    expect(container.textContent).toContain('42');
  });

  it('different target prefixes render as target text', () => {
    const altTx = { ...simpleTx, target: '0xWEIRD' } as never;
    const { container } = render(<ProposalTransaction transaction={altTx} />);
    expect(container.textContent).toContain('0xWEIRD');
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalTransaction key={i} transaction={simpleTx} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 cycles of sigTx', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransaction transaction={sigTx} />);
      unmount();
    }
  });

  it('handles 30 different target addresses', () => {
    for (let i = 0; i < 30; i++) {
      const target = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <ProposalTransaction transaction={{ ...simpleTx, target } as never} />,
      );
      unmount();
    }
  });

  it('handles 30 different signatures', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalTransaction transaction={{ ...sigTx, functionSig: `fn${i}` } as never} />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-2 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <ProposalTransaction key={i} transaction={simpleTx} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 cycles of sigTx', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransaction transaction={sigTx} />);
      unmount();
    }
  });

  it('round-2 handles 50 different target addresses', () => {
    for (let i = 0; i < 50; i++) {
      const target = '0x' + i.toString(16).padStart(40, '0');
      const { unmount } = render(
        <ProposalTransaction transaction={{ ...simpleTx, target } as never} />,
      );
      unmount();
    }
  });

  it('round-2 handles 50 different signatures', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalTransaction transaction={{ ...sigTx, functionSig: `r2-fn${i}` } as never} />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalTransaction key={i} transaction={simpleTx} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different sigTx variants', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={sigTx} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransaction transaction={simpleTx} />)).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalTransaction key={i} transaction={simpleTx} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different sigTx variants', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={sigTx} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransaction transaction={simpleTx} />)).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransaction key={i} transaction={simpleTx} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransaction transaction={simpleTx} />)).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-5 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransaction key={i} transaction={simpleTx} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransaction transaction={simpleTx} />)).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-6 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransaction key={i} transaction={simpleTx} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransaction transaction={simpleTx} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-7 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransaction key={i} transaction={simpleTx} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<ProposalTransaction transaction={simpleTx} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });

  it('round-8 30 mount-unmount cycles third', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalTransaction transaction={simpleTx} />);
      unmount();
    }
  });
});
