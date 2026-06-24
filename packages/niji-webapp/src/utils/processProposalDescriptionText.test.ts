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

  it('handles regex special chars in title as literal text', () => {
    expect(processProposalDescriptionText('My .* Title here', '.*')).toBe('My  Title here');
  });

  it('handles Unicode title (Japanese)', () => {
    expect(processProposalDescriptionText('議題: 提案内容', '議題')).toBe(': 提案内容');
  });

  it('handles description that equals the title exactly (returns empty)', () => {
    expect(processProposalDescriptionText('Title', 'Title')).toBe('');
  });

  it('handles multi-line description with title on first line', () => {
    expect(processProposalDescriptionText('Title\nLine 2\nLine 3', 'Title')).toBe(
      '\nLine 2\nLine 3',
    );
  });

  it('handles title with leading/trailing whitespace', () => {
    expect(processProposalDescriptionText('  Padded Title  body', '  Padded Title  ')).toBe('body');
  });

  it('handles title with special markdown chars', () => {
    expect(processProposalDescriptionText('# Hash Header body', '# Hash Header')).toBe(' body');
  });
});
