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
});
