import { describe, expect, it } from 'vitest';

import { processProposalDescriptionText } from './processProposalDescriptionText';

describe('processProposalDescriptionText', () => {
  it('removes first occurrence of title from description', () => {
    expect(processProposalDescriptionText('Title\nBody text', 'Title')).toBe('\nBody text');
  });

  it('only removes the first occurrence', () => {
    expect(processProposalDescriptionText('Title some Title here', 'Title')).toBe(
      ' some Title here',
    );
  });

  it('returns description unchanged when title not found', () => {
    expect(processProposalDescriptionText('No match here', 'Title')).toBe('No match here');
  });

  it('handles empty description', () => {
    expect(processProposalDescriptionText('', 'Title')).toBe('');
  });

  it('handles empty title (returns description unchanged)', () => {
    // empty string replace matches at position 0 and removes nothing
    expect(processProposalDescriptionText('description', '')).toBe('description');
  });
});
