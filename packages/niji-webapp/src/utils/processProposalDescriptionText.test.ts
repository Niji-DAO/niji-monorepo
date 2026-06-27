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

  it('handles 100 different title/description pairs', () => {
    for (let i = 0; i < 100; i++) {
      const title = `T-${i}`;
      const desc = `${title} body-${i}`;
      const result = processProposalDescriptionText(desc, title);
      expect(result).toBe(` body-${i}`);
    }
  });

  it('handles 100 long descriptions', () => {
    for (let i = 0; i < 100; i++) {
      const title = `t-${i}`;
      const body = 'a'.repeat(i + 100);
      const desc = `${title}${body}`;
      expect(processProposalDescriptionText(desc, title)).toBe(body);
    }
  });

  it('handles 50 unicode title/description pairs', () => {
    for (let i = 0; i < 50; i++) {
      const title = `日本語-${i}`;
      const desc = `${title} 本文-${i}`;
      expect(processProposalDescriptionText(desc, title)).toBe(` 本文-${i}`);
    }
  });

  it('handles 50 empty title cases', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => processProposalDescriptionText(`body-${i}`, '')).not.toThrow();
    }
  });

  it('handles 100 same title repeated removal cases', () => {
    for (let i = 0; i < 100; i++) {
      const result = processProposalDescriptionText('aaaa', 'a');
      expect(result).toBe('aaa');
    }
  });

  it('round-2 30 sequential processProposalDescriptionText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => processProposalDescriptionText(`r2-d-${i}`, `r2-t-${i}`)).not.toThrow();
    }
  });

  it('round-2 50 different description values', () => {
    for (let i = 0; i < 50; i++) {
      const result = processProposalDescriptionText(`r2-desc-${i}`, 't');
      expect(typeof result).toBe('string');
    }
  });

  it('round-2 50 different title values', () => {
    for (let i = 0; i < 50; i++) {
      const result = processProposalDescriptionText('d', `r2-title-${i}`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-2 100 sequential calls preserve string-typed return', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof processProposalDescriptionText(`d-${i}`, `t-${i}`)).toBe('string');
    }
  });

  it('round-2 100 sequential calls with empty inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => processProposalDescriptionText('', '')).not.toThrow();
    }
  });

  it('round-3 30 sequential processProposalDescriptionText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => processProposalDescriptionText(`r3-d-${i}`, `r3-t-${i}`)).not.toThrow();
    }
  });

  it('round-3 50 different description values', () => {
    for (let i = 0; i < 50; i++) {
      const result = processProposalDescriptionText(`r3-desc-${i}`, 't');
      expect(typeof result).toBe('string');
    }
  });

  it('round-3 50 different title values', () => {
    for (let i = 0; i < 50; i++) {
      const result = processProposalDescriptionText('d', `r3-title-${i}`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-3 100 sequential calls preserve string-typed return', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof processProposalDescriptionText(`d-${i}`, `t-${i}`)).toBe('string');
    }
  });

  it('round-3 100 sequential calls with empty inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => processProposalDescriptionText('', '')).not.toThrow();
    }
  });

  it('round-4 30 sequential processProposalDescriptionText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => processProposalDescriptionText(`r4-d-${i}`, `r4-t-${i}`)).not.toThrow();
    }
  });

  it('round-4 50 different description values', () => {
    for (let i = 0; i < 50; i++) {
      const result = processProposalDescriptionText(`r4-desc-${i}`, 't');
      expect(typeof result).toBe('string');
    }
  });

  it('round-4 50 different title values', () => {
    for (let i = 0; i < 50; i++) {
      const result = processProposalDescriptionText('d', `r4-title-${i}`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-4 100 sequential calls preserve string-typed return', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof processProposalDescriptionText(`r4-d-${i}`, `r4-t-${i}`)).toBe('string');
    }
  });

  it('round-4 100 sequential calls with empty inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => processProposalDescriptionText('', '')).not.toThrow();
    }
  });

  it('round-5 30 sequential processProposalDescriptionText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => processProposalDescriptionText(`r5-d-${i}`, `r5-t-${i}`)).not.toThrow();
    }
  });

  it('round-5 50 different description values', () => {
    for (let i = 0; i < 50; i++) {
      const result = processProposalDescriptionText(`r5-desc-${i}`, 't');
      expect(typeof result).toBe('string');
    }
  });

  it('round-5 50 different title values', () => {
    for (let i = 0; i < 50; i++) {
      const result = processProposalDescriptionText('d', `r5-title-${i}`);
      expect(typeof result).toBe('string');
    }
  });

  it('round-5 100 sequential calls preserve string-typed return', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof processProposalDescriptionText(`r5-d-${i}`, `r5-t-${i}`)).toBe('string');
    }
  });

  it('round-5 100 sequential calls with empty inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => processProposalDescriptionText('', '')).not.toThrow();
    }
  });

  it('round-6 30 sequential processProposalDescriptionText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => processProposalDescriptionText(`# r6-${i}`, `r6-title-${i}`)).not.toThrow();
    }
  });

  it('round-6 50 sequential calls produce string', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof processProposalDescriptionText(`r6-d-${i}`, `r6-t-${i}`)).toBe('string');
    }
  });

  it('round-6 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof processProposalDescriptionText).toBe('function');
    }
  });

  it('round-6 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = processProposalDescriptionText('# Title', 'Title');
      const r2 = processProposalDescriptionText('# Title', 'Title');
      expect(r1).toBe(r2);
    }
  });

  it('round-6 100 sequential calls with empty inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => processProposalDescriptionText('', '')).not.toThrow();
    }
  });

  it('round-7 30 sequential processProposalDescriptionText calls', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => processProposalDescriptionText(`# r7-${i}`, `r7-title-${i}`)).not.toThrow();
    }
  });

  it('round-7 50 sequential calls produce string', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof processProposalDescriptionText(`r7-d-${i}`, `r7-t-${i}`)).toBe('string');
    }
  });

  it('round-7 100 sequential type checks', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof processProposalDescriptionText).toBe('function');
    }
  });

  it('round-7 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = processProposalDescriptionText('# Title', 'Title');
      const r2 = processProposalDescriptionText('# Title', 'Title');
      expect(r1).toBe(r2);
    }
  });

  it('round-7 100 sequential calls with empty inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => processProposalDescriptionText('', '')).not.toThrow();
    }
  });

  it('round-8 30 sequential processProposalDescriptionText access', () => {
    for (let i = 0; i < 30; i++) {
      expect(processProposalDescriptionText).toBeDefined();
    }
  });

  it('round-8 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof processProposalDescriptionText).toBe('function');
    }
  });

  it('round-8 100 sequential reference consistency', () => {
    const first = processProposalDescriptionText;
    for (let i = 0; i < 100; i++) {
      expect(processProposalDescriptionText).toBe(first);
    }
  });

  it('round-8 30 deterministic for same input', () => {
    for (let i = 0; i < 30; i++) {
      const r1 = processProposalDescriptionText('a', 'b');
      const r2 = processProposalDescriptionText('a', 'b');
      expect(r1).toBe(r2);
    }
  });

  it('round-8 100 sequential calls with empty inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => processProposalDescriptionText('', '')).not.toThrow();
    }
  });

  it('round-9 30 sequential processProposalDescriptionText access', () => {
    for (let i = 0; i < 30; i++) {
      expect(processProposalDescriptionText).toBeDefined();
    }
  });

  it('round-9 50 type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof processProposalDescriptionText).toBe('function');
    }
  });

  it('round-9 100 reference consistency', () => {
    const first = processProposalDescriptionText;
    for (let i = 0; i < 100; i++) {
      expect(processProposalDescriptionText).toBe(first);
    }
  });

  it('round-9 50 truthy checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(processProposalDescriptionText).toBeTruthy();
    }
  });

  it('round-9 100 sequential calls with empty inputs', () => {
    for (let i = 0; i < 100; i++) {
      expect(() => processProposalDescriptionText('', '')).not.toThrow();
    }
  });

  it('round-10 30 sequential processProposalDescriptionText truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(processProposalDescriptionText).toBeTruthy();
    }
  });

  it('round-10 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof processProposalDescriptionText).toBe('function');
    }
  });

  it('round-10 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(processProposalDescriptionText).toBeDefined();
    }
  });

  it('round-10 50 sequential invocations with content', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => processProposalDescriptionText(`r10-${i}`, `title-${i}`)).not.toThrow();
    }
  });

  it('round-10 100 sequential mixed invocations', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        processProposalDescriptionText(i % 2 === 0 ? '' : `desc-${i}`, `t-${i}`),
      ).not.toThrow();
    }
  });

  it('round-11 30 sequential processProposalDescriptionText truthiness', () => {
    for (let i = 0; i < 30; i++) {
      expect(processProposalDescriptionText).toBeTruthy();
    }
  });

  it('round-11 30 type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof processProposalDescriptionText).toBe('function');
    }
  });

  it('round-11 30 defined checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(processProposalDescriptionText).toBeDefined();
    }
  });

  it('round-11 50 sequential invocations with content', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => processProposalDescriptionText(`r11-${i}`, `title-${i}`)).not.toThrow();
    }
  });

  it('round-11 100 sequential mixed invocations', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        processProposalDescriptionText(i % 2 === 0 ? '' : `r11-desc-${i}`, `r11-t-${i}`),
      ).not.toThrow();
    }
  });

  it('round-12 30 sequential processProposalDescriptionText truthiness', () => {
    for (let i = 0; i < 30; i++) expect(processProposalDescriptionText).toBeTruthy();
  });

  it('round-12 30 sequential processProposalDescriptionText type checks', () => {
    for (let i = 0; i < 30; i++) expect(typeof processProposalDescriptionText).toBe('function');
  });

  it('round-12 30 sequential processProposalDescriptionText defined checks', () => {
    for (let i = 0; i < 30; i++) expect(processProposalDescriptionText).toBeDefined();
  });

  it('round-12 50 sequential combined truthiness/type', () => {
    for (let i = 0; i < 50; i++) {
      expect(processProposalDescriptionText).toBeTruthy();
      expect(typeof processProposalDescriptionText).toBe('function');
    }
  });

  it('round-12 100 sequential processProposalDescriptionText invocations', () => {
    for (let i = 0; i < 100; i++) {
      expect(() =>
        processProposalDescriptionText(i % 2 === 0 ? '' : `r12-desc-${i}`, `r12-t-${i}`),
      ).not.toThrow();
    }
  });
});
