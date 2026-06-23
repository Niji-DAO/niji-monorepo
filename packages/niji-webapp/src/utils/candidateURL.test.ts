import { describe, expect, it } from 'vitest';

import { buildCandidateSlug } from './candidateURL';

describe('buildCandidateSlug', () => {
  it('lowercases address and joins with slug', () => {
    expect(buildCandidateSlug('0xABCDEF', 'my-proposal')).toBe('0xabcdef-my-proposal');
  });

  it('replaces spaces in slug with hyphens', () => {
    expect(buildCandidateSlug('0xabc', 'my new proposal')).toBe('0xabc-my-new-proposal');
  });

  it('lowercases slug', () => {
    expect(buildCandidateSlug('0xabc', 'MyProposal')).toBe('0xabc-myproposal');
  });

  it('handles multiple consecutive spaces', () => {
    expect(buildCandidateSlug('0xabc', 'a  b   c')).toBe('0xabc-a-b-c');
  });

  it('handles empty slug', () => {
    expect(buildCandidateSlug('0xABC', '')).toBe('0xabc-');
  });
});
