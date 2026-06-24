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

  it('handles description with consecutive newlines after title', () => {
    expect(processProposalDescriptionText('Title\n\n\nbody', 'Title')).toBe('\n\n\nbody');
  });

  it('handles title at end of description', () => {
    expect(processProposalDescriptionText('body Title', 'Title')).toBe('body ');
  });

  it('handles 1-char title at start (single character match)', () => {
    expect(processProposalDescriptionText('Abody', 'A')).toBe('body');
  });

  it('handles title containing regex replacement sigil ($&, $1) as literal', () => {
    // $& は String.replace の sigil だが、 search pattern 側は literal なので removal は素直
    // result 側の treatment は source `''` 直接挿入で sigil は問題ない
    expect(processProposalDescriptionText('Hello $& world', '$&')).toBe('Hello  world');
  });

  it('handles emoji-containing title', () => {
    expect(processProposalDescriptionText('🎉 Proposal text', '🎉 Proposal')).toBe(' text');
  });

  it('replaces only first instance even with overlapping titles', () => {
    // 重複 title 'aa' を 'a' で removal、 最初の 'a' のみ removal
    expect(processProposalDescriptionText('aaaa', 'a')).toBe('aaa');
  });
});
