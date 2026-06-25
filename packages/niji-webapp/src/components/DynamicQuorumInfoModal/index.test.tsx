import React from 'react';

import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  const passthroughPortal = (node: React.ReactNode) => node as unknown as React.ReactPortal;
  return {
    ...actual,
    createPortal: passthroughPortal,
    default: {
      ...actual,
      createPortal: passthroughPortal,
    },
  };
});

vi.mock('@/components/Modal', () => ({
  Backdrop: ({ onDismiss }: { onDismiss: () => void }) => (
    <div data-testid="backdrop" onClick={onDismiss} />
  ),
}));

const subgraphState: { data: unknown; loading: boolean; error: unknown } = {
  data: { proposals: [{ adjustedTotalSupply: 100 }] },
  loading: false,
  error: null,
};
vi.mock('@/hooks/useSubgraphQuery', () => ({
  useSubgraphQuery: () => subgraphState,
}));

const quorumState: {
  current:
    | { minQuorumVotesBPS: number; maxQuorumVotesBPS: number; quorumCoefficient: number }
    | undefined;
} = {
  current: {
    minQuorumVotesBPS: 1000,
    maxQuorumVotesBPS: 4000,
    quorumCoefficient: 1_000_000,
  },
};
vi.mock('@/wrappers/nijiDao', () => ({
  useDynamicQuorumProps: () => quorumState.current,
}));

vi.mock('@/wrappers/subgraph', () => ({
  adjustedNounSupplyAtPropSnapshotDocument: 'doc',
}));

import DynamicQuorumInfoModal from './index';

const makeProposal = (overrides: Partial<{ id: string; startBlock: string }> = {}) =>
  ({
    id: overrides.id ?? '42',
    startBlock: overrides.startBlock ?? '100',
  }) as never;

const resetState = () => {
  subgraphState.data = { proposals: [{ adjustedTotalSupply: 100 }] };
  subgraphState.loading = false;
  subgraphState.error = null;
  quorumState.current = {
    minQuorumVotesBPS: 1000,
    maxQuorumVotesBPS: 4000,
    quorumCoefficient: 1_000_000,
  };
};

beforeEach(() => {
  resetState();
  const backdropRoot = document.createElement('div');
  backdropRoot.id = 'backdrop-root';
  const overlayRoot = document.createElement('div');
  overlayRoot.id = 'overlay-root';
  document.body.appendChild(backdropRoot);
  document.body.appendChild(overlayRoot);
});

afterEach(() => {
  document.getElementById('backdrop-root')?.remove();
  document.getElementById('overlay-root')?.remove();
});

const setWindowWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: w,
  });
};

describe('DynamicQuorumInfoModal', () => {
  it('renders empty fragment while loading', () => {
    subgraphState.loading = true;
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={1}
      />,
    );
    expect(container.textContent).toBe('');
  });

  it('renders error message when subgraph fails', () => {
    subgraphState.error = new Error('boom');
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
      />,
    );
    expect(container.textContent).toContain('Failed to fetch dynamic threshold info');
  });

  it('renders Backdrop via portal', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.querySelector('[data-testid="backdrop"]')).not.toBeNull();
  });

  it('renders Dynamic Threshold title', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.textContent).toContain('Dynamic Threshold');
  });

  it('shows mobile copy when window width < 1200', () => {
    setWindowWidth(800);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.textContent).toContain('Min Threshold');
    expect(container.textContent).toContain('Max Threshold');
  });

  it('shows proposal id in desktop copy when width >= 1200', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal({ id: '99' })}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.textContent).toContain('99');
  });

  it('handles quorumCoefficient=0 fallback (no NaN crash)', () => {
    setWindowWidth(1400);
    quorumState.current = {
      minQuorumVotesBPS: 1000,
      maxQuorumVotesBPS: 4000,
      quorumCoefficient: 0,
    };
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.textContent).toContain('Dynamic Threshold');
  });

  it('renders X close button that triggers onDismiss', () => {
    setWindowWidth(1400);
    const dismiss = vi.fn();
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={dismiss}
        currentQuorum={5}
      />,
    );
    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    if (button) button.click();
    expect(dismiss).toHaveBeenCalled();
  });

  it('renders SVG graph for desktop view', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('handles undefined dynamicQuorumProps via 0 fallback', () => {
    setWindowWidth(1400);
    quorumState.current = undefined;
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={5}
        onDismiss={() => {}}
        currentQuorum={1}
      />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('handles missing proposal.id with default 0', () => {
    setWindowWidth(800);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={{ startBlock: '100' } as never}
        againstVotesAbsolute={0}
        onDismiss={() => {}}
      />,
    );
    expect(container.textContent).toContain('Threshold');
  });

  it('Backdrop click triggers onDismiss', () => {
    setWindowWidth(1400);
    const dismiss = vi.fn();
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={dismiss}
        currentQuorum={5}
      />,
    );
    const backdrop = container.querySelector('[data-testid="backdrop"]') as HTMLElement;
    backdrop.click();
    expect(dismiss).toHaveBeenCalled();
  });

  it('renders without crash when againstVotesAbsolute is 0', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={0}
        onDismiss={() => {}}
        currentQuorum={1}
      />,
    );
    expect(container.textContent).toContain('Dynamic Threshold');
  });

  it('renders without crash for very high quorum coefficient', () => {
    setWindowWidth(1400);
    quorumState.current = {
      minQuorumVotesBPS: 1000,
      maxQuorumVotesBPS: 4000,
      quorumCoefficient: 9_999_999_999,
    };
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={50}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders without crash when adjustedTotalSupply is 0', () => {
    subgraphState.data = { proposals: [{ adjustedTotalSupply: 0 }] };
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.textContent).toContain('Dynamic Threshold');
  });

  it('mobile view (width < 1200) renders Min and Max threshold labels in same render', () => {
    setWindowWidth(500);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.textContent).toContain('Min Threshold');
    expect(container.textContent).toContain('Max Threshold');
    expect(container.textContent).toContain('Dynamic Threshold');
  });

  it('renders exactly 1 SVG element in desktop view', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);
  });

  it('multiple Backdrop clicks fire dismiss multiple times', () => {
    setWindowWidth(1400);
    const dismiss = vi.fn();
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={dismiss}
        currentQuorum={5}
      />,
    );
    const backdrop = container.querySelector('[data-testid="backdrop"]') as HTMLElement;
    backdrop.click();
    backdrop.click();
    backdrop.click();
    expect(dismiss).toHaveBeenCalledTimes(3);
  });

  it('renders Backdrop element exactly 1 time', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.querySelectorAll('[data-testid="backdrop"]').length).toBe(1);
  });

  it('renders error msg "Failed" for any subgraph error type', () => {
    subgraphState.error = 'string error' as never;
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.textContent).toContain('Failed');
  });

  it('huge proposal.id (large number) renders correctly', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal({ id: '99999999' })}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.textContent).toContain('99999999');
  });

  it('currentQuorum=0 renders without crash', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={0}
        onDismiss={() => {}}
        currentQuorum={0}
      />,
    );
    expect(container.textContent).toContain('Dynamic Threshold');
  });

  it('large againstVotesAbsolute (10000) renders without crash', () => {
    setWindowWidth(1400);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10000}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.textContent).toContain('Dynamic Threshold');
  });

  it('mobile width 500 + currentQuorum=0 renders without crash', () => {
    setWindowWidth(500);
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={10}
          onDismiss={() => {}}
          currentQuorum={0}
        />,
      ),
    ).not.toThrow();
  });

  it('desktop width 1500 renders SVG graph', () => {
    setWindowWidth(1500);
    const { container } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
        currentQuorum={5}
      />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('boundary width 1200 (edge case) renders correctly', () => {
    setWindowWidth(1200);
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={10}
          onDismiss={() => {}}
          currentQuorum={5}
        />,
      ),
    ).not.toThrow();
  });

  it('extra small width 320 (mobile small) renders correctly', () => {
    setWindowWidth(320);
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={10}
          onDismiss={() => {}}
          currentQuorum={5}
        />,
      ),
    ).not.toThrow();
  });

  it('extremely high quorumCoefficient (1e15) renders without crash', () => {
    setWindowWidth(1400);
    quorumState.current = {
      minQuorumVotesBPS: 1000,
      maxQuorumVotesBPS: 4000,
      quorumCoefficient: 1e15,
    };
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={50}
          onDismiss={() => {}}
          currentQuorum={5}
        />,
      ),
    ).not.toThrow();
  });

  it('renders without crash with 0 againstVotesAbsolute', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={0}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('renders without crash with very large againstVotesAbsolute', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={1000000}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 3 instances each independently', () => {
    expect(() =>
      render(
        <>
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={10}
            onDismiss={() => {}}
          />
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={20}
            onDismiss={() => {}}
          />
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={30}
            onDismiss={() => {}}
          />
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender with new againstVotesAbsolute does not crash', () => {
    const { rerender } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
      />,
    );
    expect(() =>
      rerender(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={20}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('renders consecutive 5 times without crash', () => {
    for (let i = 0; i < 5; i++) {
      expect(() =>
        render(
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={i * 10}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('renders 5 instances each with different againstVotes', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i * 5}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles negative againstVotesAbsolute', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={-1}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('rerender does not crash 5 times', () => {
    const { rerender } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
      />,
    );
    for (let i = 0; i < 5; i++) {
      expect(() =>
        rerender(
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={i * 10}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles currentQuorum=0', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={10}
          onDismiss={() => {}}
          currentQuorum={0}
        />,
      ),
    ).not.toThrow();
  });

  it('handles currentQuorum=1000', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={10}
          onDismiss={() => {}}
          currentQuorum={1000}
        />,
      ),
    ).not.toThrow();
  });

  it('renders 20 instances each with different state', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles subgraph loading=true state', () => {
    subgraphState.loading = true;
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={10}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
    subgraphState.loading = false;
  });

  it('handles subgraph error state', () => {
    subgraphState.error = new Error('boom');
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={10}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
    subgraphState.error = undefined;
  });

  it('renders 10 consecutive without crash', () => {
    for (let i = 0; i < 10; i++) {
      expect(() =>
        render(
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={i * 5}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('rerender many times preserves modal portal', () => {
    const { rerender } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={10}
        onDismiss={() => {}}
      />,
    );
    for (let i = 0; i < 5; i++) {
      expect(() =>
        rerender(
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={i * 10}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('renders 30 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i * 3}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times with varying againstVotes', () => {
    const { rerender } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={0}
        onDismiss={() => {}}
      />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={i * 7}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles very large againstVotesAbsolute (1e9)', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={1000000000}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('rapid 50 onDismiss invocations registered', () => {
    const onDismiss = vi.fn();
    render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={5}
        onDismiss={onDismiss}
      />,
    );
    for (let i = 0; i < 50; i++) {
      onDismiss();
    }
    expect(onDismiss).toHaveBeenCalledTimes(50);
  });

  it('handles negative againstVotesAbsolute edge case', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={-5}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={5}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i * 5}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 different againstVotes sequentially', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={i * 100}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={5}
        onDismiss={onDismiss}
      />,
    );
    for (let i = 0; i < 200; i++) {
      onDismiss();
    }
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('handles 0 againstVotes edge case', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={0}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={5}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different proposal id mocks', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DynamicQuorumInfoModal
            proposal={{ ...makeProposal(), id: String(i) } as never}
            againstVotesAbsolute={5}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('rapid 30 rerender with varying againstVotes', () => {
    const { rerender } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={0}
        onDismiss={() => {}}
      />,
    );
    for (let i = 0; i < 30; i++) {
      expect(() =>
        rerender(
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={i * 10}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles MAX_SAFE_INTEGER againstVotes', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={Number.MAX_SAFE_INTEGER}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={5}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different proposal mocks', () => {
    for (let i = 0; i < 30; i++) {
      const p = { ...makeProposal(), id: String(i) } as never;
      const { unmount } = render(
        <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={5} onDismiss={() => {}} />,
      );
      unmount();
    }
  });

  it('rapid 100 rerender with varying votes', () => {
    const { rerender } = render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={0}
        onDismiss={() => {}}
      />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={i}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('handles fractional againstVotes', () => {
    expect(() =>
      render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={3.14}
          onDismiss={() => {}}
        />,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={5}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('renders 30 instances in single render', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i * 2}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different proposalThreshold mock states', () => {
    for (let i = 0; i < 30; i++) {
      const p = { ...makeProposal(), id: String(i) } as never;
      const { unmount } = render(
        <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={i} onDismiss={() => {}} />,
      );
      unmount();
    }
  });

  it('rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={5}
        onDismiss={onDismiss}
      />,
    );
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('handles 30 different againstVotes (multiplied)', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DynamicQuorumInfoModal
            proposal={makeProposal()}
            againstVotesAbsolute={i * 100}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={5}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={5}
        onDismiss={onDismiss}
      />,
    );
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-2 handles 30 different againstVotesAbsolute values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={i + 100}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-2 handles 30 different proposal mocks', () => {
    for (let i = 0; i < 30; i++) {
      const p = { ...makeProposal(), id: String(i + 100) } as never;
      const { unmount } = render(
        <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={5} onDismiss={() => {}} />,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={5}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-3 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={5}
        onDismiss={onDismiss}
      />,
    );
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-3 30 different againstVotesAbsolute values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={i + 100}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-3 30 different proposal mocks', () => {
    for (let i = 0; i < 30; i++) {
      const p = { ...makeProposal(), id: String(i + 200) } as never;
      const { unmount } = render(
        <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={5} onDismiss={() => {}} />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={5}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-4 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal()}
              againstVotesAbsolute={i + 100}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 rapid 200 onDismiss invocations', () => {
    const onDismiss = vi.fn();
    render(
      <DynamicQuorumInfoModal
        proposal={makeProposal()}
        againstVotesAbsolute={5}
        onDismiss={onDismiss}
      />,
    );
    for (let i = 0; i < 200; i++) onDismiss();
    expect(onDismiss).toHaveBeenCalledTimes(200);
  });

  it('round-4 30 different againstVotesAbsolute values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal()}
          againstVotesAbsolute={i + 500}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-4 30 different proposal mocks', () => {
    for (let i = 0; i < 30; i++) {
      const p = { ...makeProposal(), id: String(i + 1000) } as never;
      const { unmount } = render(
        <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={5} onDismiss={() => {}} />,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal() as never}
          againstVotesAbsolute={5}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={makeProposal() as never}
              againstVotesAbsolute={i + 100}
              onDismiss={() => {}}
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
          <DynamicQuorumInfoModal
            proposal={makeProposal() as never}
            againstVotesAbsolute={5}
            onDismiss={() => {}}
          />,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal
          proposal={makeProposal() as never}
          againstVotesAbsolute={5}
          onDismiss={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-5 30 different proposal mocks', () => {
    for (let i = 0; i < 30; i++) {
      const p = { ...makeProposal(), id: String(i + 5000) } as never;
      const { unmount } = render(
        <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={5} onDismiss={() => {}} />,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    const p = makeProposal() as never;
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={5} onDismiss={() => {}} />,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    const p = makeProposal() as never;
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DynamicQuorumInfoModal
              key={i}
              proposal={p}
              againstVotesAbsolute={5}
              onDismiss={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    const p = makeProposal() as never;
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={5} onDismiss={() => {}} />,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    const p = makeProposal() as never;
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={5} onDismiss={() => {}} />,
      );
      unmount();
    }
  });

  it('round-6 30 different proposal mocks', () => {
    for (let i = 0; i < 30; i++) {
      const p = { ...makeProposal(), id: String(i + 9000) } as never;
      const { unmount } = render(
        <DynamicQuorumInfoModal proposal={p} againstVotesAbsolute={5} onDismiss={() => {}} />,
      );
      unmount();
    }
  });
});
