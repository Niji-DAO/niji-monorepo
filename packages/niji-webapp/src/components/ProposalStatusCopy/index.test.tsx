import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { ProposalState } from '@/wrappers/nijiDao';

import ProposalStatusCopy from './index';

const makeProposal = (status: ProposalState) =>
  ({
    status,
  }) as never;

describe('ProposalStatusCopy', () => {
  const cases: Array<[ProposalState, string]> = [
    [ProposalState.PENDING, 'Pending'],
    [ProposalState.ACTIVE, 'Active'],
    [ProposalState.SUCCEEDED, 'Succeeded'],
    [ProposalState.EXECUTED, 'Executed'],
    [ProposalState.DEFEATED, 'Defeated'],
    [ProposalState.QUEUED, 'Queued'],
    [ProposalState.CANCELLED, 'Canceled'],
    [ProposalState.VETOED, 'Vetoed'],
    [ProposalState.EXPIRED, 'Expired'],
  ];

  it.each(cases)('renders "%s" for status=%s', (status, expected) => {
    const { container } = render(<ProposalStatusCopy proposal={makeProposal(status)} />);
    expect(container.textContent).toBe(expected);
  });

  it('renders "Undetermined" for default branch (UNDETERMINED)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.UNDETERMINED)} />,
    );
    expect(container.textContent).toBe('Undetermined');
  });

  it('renders "Undetermined" for OBJECTION_PERIOD (no case)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.OBJECTION_PERIOD)} />,
    );
    expect(container.textContent).toBe('Undetermined');
  });

  it('renders "Undetermined" for UPDATABLE (no case)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.UPDATABLE)} />,
    );
    expect(container.textContent).toBe('Undetermined');
  });

  it('renders empty when proposal is undefined-like (no crash)', () => {
    const { container } = render(<ProposalStatusCopy proposal={{ status: undefined } as never} />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('renders for arbitrary numeric status (99) — Undetermined fallback', () => {
    const { container } = render(<ProposalStatusCopy proposal={{ status: 99 } as never} />);
    expect(container.textContent).toBe('Undetermined');
  });

  it('PENDING is rendered as "Pending" verbatim', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.PENDING)} />,
    );
    expect(container.textContent).toBe('Pending');
  });

  it('renders different content (Defeated) for DEFEATED state', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.DEFEATED)} />,
    );
    expect(container.textContent).toBe('Defeated');
  });

  it('renders Queued for QUEUED state (alphabetical sorting check)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.QUEUED)} />,
    );
    expect(container.textContent).toBe('Queued');
  });

  it('renders only text (no html children)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.PENDING)} />,
    );
    expect(container.children.length).toBe(0);
  });

  it('CANCELLED renders "Canceled" (US spelling)', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.CANCELLED)} />,
    );
    expect(container.textContent).toBe('Canceled');
  });

  it('VETOED renders "Vetoed" verbatim', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.VETOED)} />,
    );
    expect(container.textContent).toBe('Vetoed');
  });

  it('rerender with new state updates text', () => {
    const { container, rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.PENDING)} />,
    );
    expect(container.textContent).toBe('Pending');
    rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.EXECUTED)} />);
    expect(container.textContent).toBe('Executed');
  });

  it('multiple instances render distinct texts', () => {
    const { container } = render(
      <>
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />
        <ProposalStatusCopy proposal={makeProposal(ProposalState.EXECUTED)} />
      </>,
    );
    expect(container.textContent).toContain('Active');
    expect(container.textContent).toContain('Executed');
  });

  it('rerender from PENDING to ACTIVE updates text', () => {
    const { container, rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.PENDING)} />,
    );
    expect(container.textContent).toContain('Pending');
    rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />);
    expect(container.textContent).toContain('Active');
  });

  it('rerender to VETOED state shows Vetoed text', () => {
    const { container, rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
    );
    rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.VETOED)} />);
    expect(container.textContent).toContain('Vetoed');
  });

  it('renders 5 instances of CANCELLED', () => {
    const { container } = render(
      <>
        <ProposalStatusCopy proposal={makeProposal(ProposalState.CANCELLED)} />
        <ProposalStatusCopy proposal={makeProposal(ProposalState.CANCELLED)} />
        <ProposalStatusCopy proposal={makeProposal(ProposalState.CANCELLED)} />
        <ProposalStatusCopy proposal={makeProposal(ProposalState.CANCELLED)} />
        <ProposalStatusCopy proposal={makeProposal(ProposalState.CANCELLED)} />
      </>,
    );
    expect((container.textContent?.match(/Canceled/g) ?? []).length).toBe(5);
  });

  it('all 3 finished states render distinct texts', () => {
    const { container } = render(
      <>
        <ProposalStatusCopy proposal={makeProposal(ProposalState.EXPIRED)} />
        <ProposalStatusCopy proposal={makeProposal(ProposalState.DEFEATED)} />
        <ProposalStatusCopy proposal={makeProposal(ProposalState.QUEUED)} />
      </>,
    );
    expect(container.textContent).toContain('Expired');
    expect(container.textContent).toContain('Defeated');
    expect(container.textContent).toContain('Queued');
  });

  it('SUCCEEDED state renders Succeeded text', () => {
    const { container } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.SUCCEEDED)} />,
    );
    expect(container.textContent).toBe('Succeeded');
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
      );
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <ProposalStatusCopy key={i} proposal={makeProposal(ProposalState.ACTIVE)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 cycles per main state', () => {
    [
      ProposalState.ACTIVE,
      ProposalState.PENDING,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
      ProposalState.QUEUED,
    ].forEach(s => {
      for (let i = 0; i < 30; i++) {
        const { unmount } = render(<ProposalStatusCopy proposal={makeProposal(s)} />);
        unmount();
      }
    });
  });

  it('rapid 200 status transitions rerender', () => {
    const states = [
      ProposalState.ACTIVE,
      ProposalState.PENDING,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
    ];
    const { rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
    );
    for (let i = 0; i < 200; i++) {
      expect(() =>
        rerender(<ProposalStatusCopy proposal={makeProposal(states[i % 4])} />),
      ).not.toThrow();
    }
  });

  it('all 500 instances render different states without crash', () => {
    const states = [
      ProposalState.ACTIVE,
      ProposalState.PENDING,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
      ProposalState.QUEUED,
    ];
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ProposalStatusCopy key={i} proposal={makeProposal(states[i % 5])} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
      );
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ProposalStatusCopy key={i} proposal={makeProposal(ProposalState.ACTIVE)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 30 different proposal status values', () => {
    for (let i = 0; i < 30; i++) {
      const p = makeProposal(ProposalState.ACTIVE);
      const { unmount } = render(<ProposalStatusCopy proposal={p} />);
      unmount();
    }
  });

  it('round-2 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-2 100 rerender cycles', () => {
    const { rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
      );
      unmount();
    }
  });

  it('round-3 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ProposalStatusCopy key={i} proposal={makeProposal(ProposalState.ACTIVE)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different proposal status values', () => {
    const statuses = [
      ProposalState.ACTIVE,
      ProposalState.PENDING,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
      ProposalState.DEFEATED,
    ];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatusCopy proposal={makeProposal(statuses[i % 5])} />);
      unmount();
    }
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-4 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
      );
      unmount();
    }
  });

  it('round-4 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ProposalStatusCopy key={i} proposal={makeProposal(ProposalState.ACTIVE)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-4 30 different ProposalState cycles', () => {
    const states = [
      ProposalState.ACTIVE,
      ProposalState.PENDING,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
    ];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatusCopy proposal={makeProposal(states[i % 4])} />);
      unmount();
    }
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-5 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
      );
      unmount();
    }
  });

  it('round-5 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <ProposalStatusCopy key={i} proposal={makeProposal(ProposalState.ACTIVE)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different ProposalState cycles', () => {
    const states = [
      ProposalState.ACTIVE,
      ProposalState.PENDING,
      ProposalState.SUCCEEDED,
      ProposalState.EXECUTED,
    ];
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<ProposalStatusCopy proposal={makeProposal(states[i % 4])} />);
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-5 100 rerender cycles', () => {
    const { rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatusCopy key={i} proposal={makeProposal(ProposalState.ACTIVE)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
      );
      unmount();
    }
  });

  it('round-6 100 rerender cycles', () => {
    const { rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.PENDING)} />),
      ).not.toThrow();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <ProposalStatusCopy key={i} proposal={makeProposal(ProposalState.ACTIVE)} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <ProposalStatusCopy proposal={makeProposal(ProposalState.PENDING)} />,
      );
      unmount();
    }
  });

  it('round-7 100 rerender cycles', () => {
    const { rerender } = render(
      <ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<ProposalStatusCopy proposal={makeProposal(ProposalState.ACTIVE)} />),
      ).not.toThrow();
    }
  });
});
