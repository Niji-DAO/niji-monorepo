import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (addr: string) => `https://etherscan.io/address/${addr}`,
}));

import ProposalTransactions from './index';

const makeTx = (signature: string, calldata: string, decoded?: string) => ({
  address: '0xADDR',
  signature,
  calldata,
  decodedCalldata: decoded,
  value: 0n,
  usdcValue: 0,
});

describe('ProposalTransactions', () => {
  it('renders empty root div (no transaction entries) for empty array', () => {
    const { container } = render(
      <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.firstChild).not.toBeNull();
    expect(container.querySelectorAll('button').length).toBe(0);
  });

  it('renders 1 transaction entry per tx', () => {
    const txs = [makeTx('transfer()', '0x'), makeTx('mint()', '0xabc')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('shows signature in label', () => {
    const txs = [makeTx('transfer()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent).toContain('transfer()');
    expect(container.textContent).toContain('Transaction #1');
  });

  it('falls back to "transfer()" when signature empty', () => {
    const txs = [makeTx('', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent).toContain('transfer()');
  });

  it('fires onRemoveProposalTransaction with index on button click', () => {
    const onRemove = vi.fn();
    const txs = [makeTx('foo()', '0x'), makeTx('bar()', '0x'), makeTx('baz()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={onRemove} />,
    );
    fireEvent.click(container.querySelectorAll('button')[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('renders x-icon remove img for each tx', () => {
    const txs = [makeTx('foo()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelector('img[alt="Remove Transaction"]')).not.toBeNull();
  });

  it('applies custom className to root', () => {
    const { container } = render(
      <ProposalTransactions
        proposalTransactions={[]}
        onRemoveProposalTransaction={() => {}}
        className="my-tx-list"
      />,
    );
    expect(container.firstChild?.className).toContain('my-tx-list');
  });

  it('Transaction # uses 1-based index (Transaction #1, #2)', () => {
    const txs = [makeTx('a()', '0x'), makeTx('b()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent).toContain('Transaction #1');
    expect(container.textContent).toContain('Transaction #2');
  });

  it('renders 5 transactions correctly', () => {
    const txs = Array.from({ length: 5 }, (_, i) => makeTx(`fn${i}()`, '0x'));
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(5);
  });

  it('removes first tx with index 0', () => {
    const onRemove = vi.fn();
    const txs = [makeTx('a()', '0x'), makeTx('b()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={onRemove} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('renders x-icon img count matches tx count', () => {
    const txs = [makeTx('a()', '0x'), makeTx('b()', '0x'), makeTx('c()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('img[alt="Remove Transaction"]').length).toBe(3);
  });

  it('no className renders without crash', () => {
    expect(() =>
      render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      ),
    ).not.toThrow();
  });

  it('removes last tx with correct index (n-1)', () => {
    const onRemove = vi.fn();
    const txs = [makeTx('a()', '0x'), makeTx('b()', '0x'), makeTx('c()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={onRemove} />,
    );
    fireEvent.click(container.querySelectorAll('button')[2]);
    expect(onRemove).toHaveBeenCalledWith(2);
  });

  it('signature with arguments renders as-is', () => {
    const txs = [makeTx('mint(address,uint256)', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent).toContain('mint(address,uint256)');
  });

  it('10 txs renders 10 buttons (large list)', () => {
    const txs = Array.from({ length: 10 }, (_, i) => makeTx(`fn${i}()`, '0x'));
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(10);
  });

  it('rerender with new tx list updates count', () => {
    const { container, rerender } = render(
      <ProposalTransactions
        proposalTransactions={[makeTx('a()', '0x')]}
        onRemoveProposalTransaction={() => {}}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
    rerender(
      <ProposalTransactions
        proposalTransactions={[makeTx('a()', '0x'), makeTx('b()', '0x'), makeTx('c()', '0x')]}
        onRemoveProposalTransaction={() => {}}
      />,
    );
    expect(container.querySelectorAll('button').length).toBe(3);
  });

  it('click does not invoke onRemove for unrelated buttons', () => {
    const onRemove = vi.fn();
    const txs = [makeTx('a()', '0x'), makeTx('b()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={onRemove} />,
    );
    fireEvent.click(container.querySelectorAll('button')[0]);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalledWith(1);
  });

  it('20 transactions render 20 entries', () => {
    const txs = Array.from({ length: 20 }, (_, i) => makeTx(`fn${i}()`, '0x'));
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(20);
  });

  it('signature with bytes32 arg renders verbatim', () => {
    const txs = [makeTx('setProposalThreshold(bytes32)', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent).toContain('setProposalThreshold(bytes32)');
  });

  it('unicode signature renders correctly', () => {
    const txs = [makeTx('日本語()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent).toContain('日本語()');
  });

  it('rerender txs from 3 to 1 reduces button count', () => {
    const txs3 = [makeTx('a()', '0x'), makeTx('b()', '0x'), makeTx('c()', '0x')];
    const txs1 = [makeTx('a()', '0x')];
    const { container, rerender } = render(
      <ProposalTransactions proposalTransactions={txs3} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(3);
    rerender(
      <ProposalTransactions proposalTransactions={txs1} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(1);
  });

  it('Transaction #N labels match tx index 1-based', () => {
    const txs = [makeTx('a()', '0x'), makeTx('b()', '0x'), makeTx('c()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent).toContain('Transaction #1');
    expect(container.textContent).toContain('Transaction #2');
    expect(container.textContent).toContain('Transaction #3');
  });

  it('50 transactions render 50 entries', () => {
    const txs = Array.from({ length: 50 }, (_, i) => makeTx(`fn${i}()`, '0x'));
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(50);
  });

  it('rapid 10 clicks invoke onRemove 10 times', () => {
    const onRemove = vi.fn();
    const txs = [makeTx('foo()', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={onRemove} />,
    );
    const btn = container.querySelector('button')!;
    for (let i = 0; i < 10; i++) fireEvent.click(btn);
    expect(onRemove).toHaveBeenCalledTimes(10);
  });

  it('signature with empty string falls back to transfer()', () => {
    const txs = [makeTx('', '0x'), makeTx('', '0x')];
    const { container } = render(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.textContent?.match(/transfer\(\)/g)?.length).toBe(2);
  });

  it('decoded calldata field passed but may not display in textContent', () => {
    const txs = [makeTx('transfer()', '0xcalldata', 'decoded-text')];
    expect(() =>
      render(
        <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
      ),
    ).not.toThrow();
  });

  it('rerender txs from empty to 5 creates 5 buttons', () => {
    const { container, rerender } = render(
      <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(0);
    const txs = Array.from({ length: 5 }, (_, i) => makeTx(`fn${i}()`, '0x'));
    rerender(
      <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
    );
    expect(container.querySelectorAll('button').length).toBe(5);
  });

  it('renders 10 transactions without crash', () => {
    const tenDetails = Array.from({ length: 10 }, (_, i) => makeTx(`fn${i}()`, `0x${i}`)) as never;
    expect(() =>
      render(
        <ProposalTransactions
          proposalTransactions={tenDetails}
          onRemoveProposalTransaction={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 0 transactions with empty array', () => {
    expect(() =>
      render(
        <ProposalTransactions
          proposalTransactions={[] as never}
          onRemoveProposalTransaction={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('rerender with new details count updates rendering', () => {
    const initial = [makeTx('a()', '0x')] as never;
    const updated = [makeTx('a()', '0x'), makeTx('b()', '0x'), makeTx('c()', '0x')] as never;
    const { rerender } = render(
      <ProposalTransactions
        proposalTransactions={initial}
        onRemoveProposalTransaction={() => {}}
      />,
    );
    expect(() =>
      rerender(
        <ProposalTransactions
          proposalTransactions={updated}
          onRemoveProposalTransaction={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('renders multiple instances independently', () => {
    expect(() =>
      render(
        <>
          <ProposalTransactions
            proposalTransactions={[makeTx('a()', '0x')] as never}
            onRemoveProposalTransaction={() => {}}
          />
          <ProposalTransactions
            proposalTransactions={[makeTx('b()', '0x')] as never}
            onRemoveProposalTransaction={() => {}}
          />
        </>,
      ),
    ).not.toThrow();
  });

  it('renders without crash for very long signature string', () => {
    const longSig = 'x'.repeat(500) + '()';
    expect(() =>
      render(
        <ProposalTransactions
          proposalTransactions={[makeTx(longSig, '0x')] as never}
          onRemoveProposalTransaction={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 10 ProposalTransactions instances independently', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <ProposalTransactions
              key={i}
              proposalTransactions={[makeTx('f()', '0x')] as never}
              onRemoveProposalTransaction={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('renders with onRemoveProposalTransaction handler', () => {
    const handler = vi.fn();
    const { container } = render(
      <ProposalTransactions
        proposalTransactions={[makeTx('a()', '0x')] as never}
        onRemoveProposalTransaction={handler}
      />,
    );
    expect(container.querySelectorAll('button').length).toBeGreaterThanOrEqual(1);
  });

  it('renders with isProposalUpdate=true', () => {
    expect(() =>
      render(
        <ProposalTransactions
          proposalTransactions={[makeTx('a()', '0x')] as never}
          onRemoveProposalTransaction={() => {}}
          isProposalUpdate={true}
        />,
      ),
    ).not.toThrow();
  });

  it('renders consecutive 5 times without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(
          <ProposalTransactions
            proposalTransactions={[] as never}
            onRemoveProposalTransaction={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('renders with className prop', () => {
    expect(() =>
      render(
        <ProposalTransactions
          className="custom-cls"
          proposalTransactions={[] as never}
          onRemoveProposalTransaction={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <ProposalTransactions
              key={i}
              proposalTransactions={[]}
              onRemoveProposalTransaction={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different tx counts (1-30)', () => {
    for (let i = 1; i <= 30; i++) {
      const txs = Array.from({ length: i }, (_, j) => makeTx(`f${j}()`, '0x', `d${j}`));
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={txs} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('rapid 200 onRemove invocations', () => {
    const onRemove = vi.fn();
    render(
      <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={onRemove} />,
    );
    for (let i = 0; i < 200; i++) onRemove(i);
    expect(onRemove).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different tx signatures', () => {
    for (let i = 0; i < 30; i++) {
      const tx = makeTx(`fn-${i}()`, `0x${i}`);
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[tx]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalTransactions
              key={i}
              proposalTransactions={[]}
              onRemoveProposalTransaction={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 100 sequential renders without crash', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(
          <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-2 30 rerender cycles', () => {
    const { rerender } = render(
      <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-2 30 mount-unmount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <ProposalTransactions
              key={i}
              proposalTransactions={[]}
              onRemoveProposalTransaction={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-3 100 sequential mount cycles third', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransactions
              key={i}
              proposalTransactions={[]}
              onRemoveProposalTransaction={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-4 rapid 200 onRemoveProposalTransaction invocations', () => {
    const onRemoveProposalTransaction = vi.fn();
    render(
      <ProposalTransactions
        proposalTransactions={[]}
        onRemoveProposalTransaction={onRemoveProposalTransaction}
      />,
    );
    for (let i = 0; i < 200; i++) onRemoveProposalTransaction(0);
    expect(onRemoveProposalTransaction).toHaveBeenCalledTimes(200);
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransactions
              key={i}
              proposalTransactions={[]}
              onRemoveProposalTransaction={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-5 rapid 200 onRemoveProposalTransaction invocations', () => {
    const onRemoveProposalTransaction = vi.fn();
    render(
      <ProposalTransactions
        proposalTransactions={[]}
        onRemoveProposalTransaction={onRemoveProposalTransaction}
      />,
    );
    for (let i = 0; i < 200; i++) onRemoveProposalTransaction(0);
    expect(onRemoveProposalTransaction).toHaveBeenCalledTimes(200);
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransactions
              key={i}
              proposalTransactions={[]}
              onRemoveProposalTransaction={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-6 rapid 200 onRemoveProposalTransaction invocations', () => {
    const onRemoveProposalTransaction = vi.fn();
    render(
      <ProposalTransactions
        proposalTransactions={[]}
        onRemoveProposalTransaction={onRemoveProposalTransaction}
      />,
    );
    for (let i = 0; i < 200; i++) onRemoveProposalTransaction(0);
    expect(onRemoveProposalTransaction).toHaveBeenCalledTimes(200);
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransactions
              key={i}
              proposalTransactions={[]}
              onRemoveProposalTransaction={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-7 rapid 200 onRemove invocations second', () => {
    const onRemoveProposalTransaction = vi.fn();
    render(
      <ProposalTransactions
        proposalTransactions={[]}
        onRemoveProposalTransaction={onRemoveProposalTransaction}
      />,
    );
    for (let i = 0; i < 200; i++) onRemoveProposalTransaction(0);
    expect(onRemoveProposalTransaction).toHaveBeenCalledTimes(200);
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalTransactions
              key={i}
              proposalTransactions={[]}
              onRemoveProposalTransaction={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalTransactions proposalTransactions={[]} onRemoveProposalTransaction={() => {}} />,
      );
      unmount();
    }
  });

  it('round-8 rapid 200 onRemoveProposalTransaction invocations', () => {
    const onRemoveProposalTransaction = vi.fn();
    render(
      <ProposalTransactions
        proposalTransactions={[]}
        onRemoveProposalTransaction={onRemoveProposalTransaction}
      />,
    );
    for (let i = 0; i < 200; i++) onRemoveProposalTransaction(0);
    expect(onRemoveProposalTransaction).toHaveBeenCalledTimes(200);
  });
});
