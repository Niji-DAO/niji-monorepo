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
});
