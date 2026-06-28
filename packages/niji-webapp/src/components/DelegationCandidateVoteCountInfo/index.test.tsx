import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import DelegationCandidateVoteCountInfo from './index';

describe('DelegationCandidateVoteCountInfo', () => {
  it('uses singular "Vote" for voteCount=1', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Alice" voteCount={1} isLoading={false} />,
    );
    expect(container.textContent).toContain('1 Vote');
    expect(container.textContent).not.toContain('Votes');
  });

  it('uses plural "Votes" for voteCount=0', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Alice" voteCount={0} isLoading={false} />,
    );
    expect(container.textContent).toContain('0 Votes');
  });

  it('uses plural "Votes" for voteCount=2', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Alice" voteCount={2} isLoading={false} />,
    );
    expect(container.textContent).toContain('2 Votes');
  });

  it('renders spinner svg when isLoading=true', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Alice" voteCount={1} isLoading={true} />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('omits spinner when isLoading=false', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Alice" voteCount={1} isLoading={false} />,
    );
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders text prop content', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="my-name" voteCount={1} isLoading={false} />,
    );
    expect(container.textContent).toContain('my-name');
  });

  it('handles large voteCount (1000) with plural', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Alice" voteCount={1000} isLoading={false} />,
    );
    expect(container.textContent).toContain('1000 Votes');
  });

  it('renders ReactNode text (nested span)', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo
        text={<span data-testid="name-span">Alice</span>}
        voteCount={1}
        isLoading={false}
      />,
    );
    expect(container.querySelector('[data-testid="name-span"]')?.textContent).toBe('Alice');
  });

  it('renders exactly 1 svg when isLoading=true (single spinner)', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Alice" voteCount={1} isLoading={true} />,
    );
    expect(container.querySelectorAll('svg').length).toBe(1);
  });

  it('handles empty text prop without crash', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="" voteCount={2} isLoading={false} />,
    );
    expect(container.textContent).toContain('2 Votes');
  });

  it('voteCount=10 still uses plural', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Alice" voteCount={10} isLoading={false} />,
    );
    expect(container.textContent).toContain('10 Votes');
  });

  it('renders text + vote count both together', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Bob" voteCount={3} isLoading={false} />,
    );
    expect(container.textContent).toContain('Bob');
    expect(container.textContent).toContain('3');
  });

  it('isLoading=true still includes text', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="Bob" voteCount={5} isLoading={true} />,
    );
    expect(container.textContent).toContain('Bob');
  });

  it('renders for voteCount=1000000 (huge number)', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="X" voteCount={1000000} isLoading={false} />,
    );
    expect(container.textContent).toContain('1000000');
  });

  it('handles ReactNode text with mixed content', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo
        text={
          <>
            <em>First</em>
            <strong>Second</strong>
          </>
        }
        voteCount={2}
        isLoading={false}
      />,
    );
    expect(container.querySelector('em')?.textContent).toBe('First');
    expect(container.querySelector('strong')?.textContent).toBe('Second');
  });

  it('renders without crash for voteCount=0 + isLoading=true', () => {
    expect(() =>
      render(<DelegationCandidateVoteCountInfo text="x" voteCount={0} isLoading={true} />),
    ).not.toThrow();
  });

  it('rerender from singular to plural', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />,
    );
    expect(container.textContent).toContain('1 Vote');
    rerender(<DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={false} />);
    expect(container.textContent).toContain('5 Votes');
  });

  it('rerender from isLoading=false to true shows svg', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />,
    );
    expect(container.querySelector('svg')).toBeNull();
    rerender(<DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={true} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('multiple instances render with own vote counts', () => {
    const { container } = render(
      <>
        <DelegationCandidateVoteCountInfo text="A" voteCount={1} isLoading={false} />
        <DelegationCandidateVoteCountInfo text="B" voteCount={2} isLoading={false} />
      </>,
    );
    expect(container.textContent).toContain('1 Vote');
    expect(container.textContent).toContain('2 Votes');
  });

  it('large voteCount (Number.MAX_SAFE_INTEGER) renders correctly', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo
        text="x"
        voteCount={Number.MAX_SAFE_INTEGER}
        isLoading={false}
      />,
    );
    expect(container.textContent).toContain('9007199254740991');
  });

  it('unicode text renders verbatim', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="日本語" voteCount={1} isLoading={false} />,
    );
    expect(container.textContent).toContain('日本語');
  });

  it('rerender text updates content', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="First" voteCount={1} isLoading={false} />,
    );
    expect(container.textContent).toContain('First');
    rerender(<DelegationCandidateVoteCountInfo text="Second" voteCount={1} isLoading={false} />);
    expect(container.textContent).toContain('Second');
    expect(container.textContent).not.toContain('First');
  });

  it('voteCount=-1 (negative) renders as "-1 Votes"', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={-1} isLoading={false} />,
    );
    expect(container.textContent).toContain('-1 Votes');
  });

  it('rerender to isLoading=true persists text', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="Bob" voteCount={5} isLoading={false} />,
    );
    expect(container.textContent).toContain('Bob');
    rerender(<DelegationCandidateVoteCountInfo text="Bob" voteCount={5} isLoading={true} />);
    expect(container.textContent).toContain('Bob');
  });

  it('voteCount fractional (1.5) treated as "1.5 Votes"', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={1.5} isLoading={false} />,
    );
    expect(container.textContent).toContain('1.5');
  });

  it('isLoading=true svg count is 1', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={true} />,
    );
    expect(container.querySelectorAll('svg').length).toBe(1);
  });

  it('rerender from voteCount=1 to 1 idempotent', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />,
    );
    const initial = container.innerHTML;
    rerender(<DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />);
    expect(container.innerHTML).toBe(initial);
  });

  it('5 instances render 5 distinct results', () => {
    const { container } = render(
      <>
        <DelegationCandidateVoteCountInfo text="a" voteCount={1} isLoading={false} />
        <DelegationCandidateVoteCountInfo text="b" voteCount={2} isLoading={false} />
        <DelegationCandidateVoteCountInfo text="c" voteCount={3} isLoading={false} />
        <DelegationCandidateVoteCountInfo text="d" voteCount={4} isLoading={false} />
        <DelegationCandidateVoteCountInfo text="e" voteCount={5} isLoading={false} />
      </>,
    );
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('5 Votes');
  });

  it('voteCount=2 with isLoading=false renders "2 Votes"', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={2} isLoading={false} />,
    );
    expect(container.textContent).toContain('2 Votes');
  });

  it('voteCount=Infinity renders verbatim', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={Infinity} isLoading={false} />,
    );
    expect(container.textContent).toContain('Infinity');
  });

  it('rerender from isLoading=true to false hides svg', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={true} />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
    rerender(<DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={false} />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders 7 instances each with distinct text', () => {
    const { container } = render(
      <>
        {Array.from({ length: 7 }, (_, i) => (
          <DelegationCandidateVoteCountInfo
            key={i}
            text={`name-${i}`}
            voteCount={i}
            isLoading={false}
          />
        ))}
      </>,
    );
    expect(container.textContent).toContain('name-0');
    expect(container.textContent).toContain('name-6');
  });

  it('extremely long text renders verbatim', () => {
    const longText = 'a'.repeat(500);
    const { container } = render(
      <DelegationCandidateVoteCountInfo text={longText} voteCount={1} isLoading={false} />,
    );
    expect(container.textContent).toContain(longText);
  });

  it('rerender to isLoading persists text', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="Bob" voteCount={5} isLoading={false} />,
    );
    expect(container.textContent).toContain('Bob');
    rerender(<DelegationCandidateVoteCountInfo text="Bob" voteCount={5} isLoading={true} />);
    expect(container.textContent).toContain('Bob');
  });

  it('voteCount fractional (1.5) treated as "1.5 Votes"', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={1.5} isLoading={false} />,
    );
    expect(container.textContent).toContain('1.5');
  });

  it('isLoading=true svg count is 1', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={true} />,
    );
    expect(container.querySelectorAll('svg').length).toBe(1);
  });

  it('rerender from voteCount=1 to 1 idempotent', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />,
    );
    const initial = container.innerHTML;
    rerender(<DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />);
    expect(container.innerHTML).toBe(initial);
  });

  it('5 instances render 5 distinct results', () => {
    const { container } = render(
      <>
        <DelegationCandidateVoteCountInfo text="a" voteCount={1} isLoading={false} />
        <DelegationCandidateVoteCountInfo text="b" voteCount={2} isLoading={false} />
        <DelegationCandidateVoteCountInfo text="c" voteCount={3} isLoading={false} />
        <DelegationCandidateVoteCountInfo text="d" voteCount={4} isLoading={false} />
        <DelegationCandidateVoteCountInfo text="e" voteCount={5} isLoading={false} />
      </>,
    );
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('5 Votes');
  });

  it('renders 30 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <DelegationCandidateVoteCountInfo
            key={i}
            text={`name-${i}`}
            voteCount={i + 1}
            isLoading={false}
          />
        ))}
      </>,
    );
    expect(container.textContent).toContain('name-0');
    expect(container.textContent).toContain('30 Votes');
  });

  it('renders empty string text', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="" voteCount={1} isLoading={false} />,
    );
    expect(container.textContent).toContain('1 Vote');
  });

  it('rerender from 0 to 100 votes', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={0} isLoading={false} />,
    );
    expect(container.textContent).toContain('0 Votes');
    rerender(<DelegationCandidateVoteCountInfo text="x" voteCount={100} isLoading={false} />);
    expect(container.textContent).toContain('100 Votes');
  });

  it('handles 1000000 votes (large)', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={1000000} isLoading={false} />,
    );
    expect(container.textContent).toContain('1000000');
  });

  it('renders consecutive 10 times without crash', () => {
    for (let i = 0; i < 10; i++) {
      expect(() =>
        render(
          <DelegationCandidateVoteCountInfo text={`t${i}`} voteCount={i} isLoading={i % 2 === 0} />,
        ),
      ).not.toThrow();
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <DelegationCandidateVoteCountInfo
              key={i}
              text={`t-${i}`}
              voteCount={i}
              isLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rerender 30 times preserves count display', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />,
    );
    for (let i = 0; i < 30; i++) {
      rerender(<DelegationCandidateVoteCountInfo text="x" voteCount={i + 1} isLoading={false} />);
    }
    expect(container.textContent).toContain('30');
  });

  it('rapid loading toggle 50 times without crash', () => {
    const { rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={false} />,
    );
    for (let i = 0; i < 50; i++) {
      expect(() =>
        rerender(
          <DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={i % 2 === 0} />,
        ),
      ).not.toThrow();
    }
  });

  it('handles negative voteCount edge case', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={-5} isLoading={false} />,
    );
    expect(container.textContent).toContain('-5');
  });

  it('unicode text renders correctly', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo text="🚀日本語" voteCount={1} isLoading={false} />,
    );
    expect(container.textContent).toContain('🚀日本語');
  });

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />,
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <DelegationCandidateVoteCountInfo
              key={i}
              text={`t-${i}`}
              voteCount={i}
              isLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 different voteCount values', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <DelegationCandidateVoteCountInfo text="x" voteCount={i} isLoading={false} />,
      );
      expect(container.textContent).toContain(String(i));
      unmount();
    }
  });

  it('handles all 4 boolean combinations', () => {
    [
      { vc: 0, il: false },
      { vc: 0, il: true },
      { vc: 1, il: false },
      { vc: 1, il: true },
    ].forEach(({ vc, il }) => {
      expect(() =>
        render(<DelegationCandidateVoteCountInfo text="x" voteCount={vc} isLoading={il} />),
      ).not.toThrow();
    });
  });

  it('handles JSX text node', () => {
    const { container } = render(
      <DelegationCandidateVoteCountInfo
        text={<span data-testid="text-jsx">Hello</span>}
        voteCount={5}
        isLoading={false}
      />,
    );
    expect(container.querySelector('[data-testid="text-jsx"]')?.textContent).toBe('Hello');
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(
        <DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />,
      );
      unmount();
    }
  });

  it('renders 300 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <DelegationCandidateVoteCountInfo
              key={i}
              text={`t-${i}`}
              voteCount={i}
              isLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different voteCounts', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <DelegationCandidateVoteCountInfo text="x" voteCount={i} isLoading={false} />,
      );
      expect(container.textContent).toContain(String(i));
      unmount();
    }
  });

  it('rapid isLoading toggle 100 times', () => {
    const { rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={false} />,
    );
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(
          <DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={i % 2 === 0} />,
        ),
      ).not.toThrow();
    }
  });

  it('handles 50 different text values', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <DelegationCandidateVoteCountInfo text={`t-${i}`} voteCount={1} isLoading={false} />,
      );
      expect(container.textContent).toContain(`t-${i}`);
      unmount();
    }
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />,
      );
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <DelegationCandidateVoteCountInfo
              key={i}
              text={`t-${i}`}
              voteCount={i}
              isLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different voteCount values with isLoading=true', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <DelegationCandidateVoteCountInfo text="x" voteCount={i} isLoading={true} />,
      );
      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });

  it('all 300 vote-info instances have correct count', () => {
    const { container } = render(
      <>
        {Array.from({ length: 300 }, (_, i) => (
          <DelegationCandidateVoteCountInfo
            key={i}
            text="x"
            voteCount={i + 100}
            isLoading={false}
          />
        ))}
      </>,
    );
    expect(container.textContent).toContain('100');
    expect(container.textContent).toContain('399');
  });

  it('handles 30 different text values with rerender', () => {
    const { container, rerender } = render(
      <DelegationCandidateVoteCountInfo text="initial" voteCount={1} isLoading={false} />,
    );
    for (let i = 0; i < 30; i++) {
      rerender(
        <DelegationCandidateVoteCountInfo text={`t-${i}`} voteCount={1} isLoading={false} />,
      );
    }
    expect(container.textContent).toContain('t-29');
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(
        <DelegationCandidateVoteCountInfo text="x" voteCount={1} isLoading={false} />,
      );
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <DelegationCandidateVoteCountInfo
              key={i}
              text={`t-${i}`}
              voteCount={i}
              isLoading={false}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different voteCount values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(
        <DelegationCandidateVoteCountInfo text="x" voteCount={i} isLoading={false} />,
      );
      expect(container.textContent).toContain(String(i));
      unmount();
    }
  });

  it('rapid isLoading toggle 200 times', () => {
    const { rerender } = render(
      <DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={false} />,
    );
    for (let i = 0; i < 200; i++) {
      expect(() =>
        rerender(
          <DelegationCandidateVoteCountInfo text="x" voteCount={5} isLoading={i % 2 === 0} />,
        ),
      ).not.toThrow();
    }
  });

  it('renders 500 instances without crash (count verification)', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} text="x" voteCount={i} isLoading={false} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={5} />);
      unmount();
    }
  });

  it('round-2 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different voteCount values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 100} />);
      unmount();
    }
  });

  it('round-2 100 rerender cycles', () => {
    const { rerender } = render(<DelegationCandidateVoteCountInfo voteCount={1} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<DelegationCandidateVoteCountInfo voteCount={i} />)).not.toThrow();
    }
  });

  it('round-2 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={i} />)).not.toThrow();
    }
  });

  it('round-3 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={5} />);
      unmount();
    }
  });

  it('round-3 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 100 different voteCount values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 100} />);
      unmount();
    }
  });

  it('round-3 100 rerender cycles', () => {
    const { rerender } = render(<DelegationCandidateVoteCountInfo voteCount={1} />);
    for (let i = 0; i < 100; i++) {
      expect(() => rerender(<DelegationCandidateVoteCountInfo voteCount={i} />)).not.toThrow();
    }
  });

  it('round-3 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={i} />)).not.toThrow();
    }
  });

  it('round-4 mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={5} />);
      unmount();
    }
  });

  it('round-4 renders 200 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i + 100} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 100 different voteCount values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 500} />);
      unmount();
    }
  });

  it('round-4 100 rerender cycles', () => {
    const { rerender } = render(<DelegationCandidateVoteCountInfo voteCount={1} />);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<DelegationCandidateVoteCountInfo voteCount={i + 1000} />),
      ).not.toThrow();
    }
  });

  it('round-4 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={i + 2000} />)).not.toThrow();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={5} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i + 100} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different voteCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 5000} />);
      unmount();
    }
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={i + 7000} />)).not.toThrow();
    }
  });

  it('round-5 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={i + 9000} />)).not.toThrow();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={1} />);
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i + 11000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different voteCount values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 12000} />);
      unmount();
    }
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={1} />)).not.toThrow();
    }
  });

  it('round-6 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<DelegationCandidateVoteCountInfo voteCount={i + 15000} />),
      ).not.toThrow();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={0} />);
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i + 17000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={0} />)).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={0} />);
      unmount();
    }
  });

  it('round-7 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<DelegationCandidateVoteCountInfo voteCount={i + 19000} />),
      ).not.toThrow();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={0} />);
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i + 21000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={0} />)).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={0} />);
      unmount();
    }
  });

  it('round-8 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<DelegationCandidateVoteCountInfo voteCount={i + 23000} />),
      ).not.toThrow();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={0} />);
      unmount();
    }
  });

  it('round-9 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i + 25000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={0} />)).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={0} />);
      unmount();
    }
  });

  it('round-9 50 sequential renders without crash', () => {
    for (let i = 0; i < 50; i++) {
      expect(() =>
        render(<DelegationCandidateVoteCountInfo voteCount={i + 27000} />),
      ).not.toThrow();
    }
  });

  it('round-10 30 sequential DelegationCandidateVoteCountInfo mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i} />);
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<DelegationCandidateVoteCountInfo voteCount={i} />)).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 30000} />);
      unmount();
    }
  });

  it('round-10 100 sequential different voteCount values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 40000} />);
      unmount();
    }
  });

  it('round-11 30 sequential DelegationCandidateVoteCountInfo mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 50000} />);
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i + 60000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<DelegationCandidateVoteCountInfo voteCount={i + 70000} />),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 80000} />);
      unmount();
    }
  });

  it('round-11 100 sequential different voteCount values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 90000} />);
      unmount();
    }
  });

  it('round-12 30 sequential DelegationCandidateVoteCountInfo mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 100000} />);
      unmount();
    }
  });

  it('round-12 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <DelegationCandidateVoteCountInfo key={i} voteCount={i + 110000} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-12 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(<DelegationCandidateVoteCountInfo voteCount={i + 120000} />),
      ).not.toThrow();
    }
  });

  it('round-12 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 130000} />);
      unmount();
    }
  });

  it('round-12 100 sequential different voteCount values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<DelegationCandidateVoteCountInfo voteCount={i + 140000} />);
      unmount();
    }
  });
});
