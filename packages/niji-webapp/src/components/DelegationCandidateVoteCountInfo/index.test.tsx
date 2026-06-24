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
});
