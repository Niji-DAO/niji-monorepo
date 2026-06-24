import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/Niji', () => ({
  NijiCircular: ({ nounId }: { nounId: bigint }) => (
    <span data-testid="niji-circular">{nounId.toString()}</span>
  ),
}));

import HorizontalStackedNijis from './index';

describe('HorizontalStackedNijis', () => {
  it('renders nothing for empty array', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={[]} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(0);
  });

  it('renders all nounIds up to 6', () => {
    const ids = ['1', '2', '3'];
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(3);
  });

  it('caps at 6 elements (slice(0,6))', () => {
    const ids = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('wraps in a div with classes.wrapper', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1']} />);
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('renders single niji for [id]', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['42']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(1);
    expect(container.querySelector('[data-testid="niji-circular"]')?.textContent).toBe('42');
  });

  it('renders exactly 6 for input of exactly 6', () => {
    const ids = ['1', '2', '3', '4', '5', '6'];
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('converts string nounId to bigint via BigInt() in mock', () => {
    // mock NijiCircular は bigint を toString() で表示、 BigInt('100').toString() === '100'
    const { container } = render(<HorizontalStackedNijis nounIds={['100']} />);
    expect(container.querySelector('[data-testid="niji-circular"]')?.textContent).toBe('100');
  });

  it('reverses display order (last input → first DOM)', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2', '3']} />);
    const nijis = container.querySelectorAll('[data-testid="niji-circular"]');
    // .reverse() で DOM 順序が [3, 2, 1]
    expect(nijis[0].textContent).toBe('3');
    expect(nijis[1].textContent).toBe('2');
    expect(nijis[2].textContent).toBe('1');
  });

  it('inner niji wrapper has inline style left = 25*i px', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2']} />);
    // 内側 div の style に left:0px / left:25px を持つ
    const innerDivs = container.querySelectorAll('div div');
    const lefts = Array.from(innerDivs)
      .map(d => d.getAttribute('style') ?? '')
      .filter(s => s.includes('left'));
    expect(lefts.some(s => s.includes('left: 0px'))).toBe(true);
    expect(lefts.some(s => s.includes('left: 25px'))).toBe(true);
  });

  it('renders 4 nijis with left: 0/25/50/75', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2', '3', '4']} />);
    const innerDivs = container.querySelectorAll('div div');
    const styles = Array.from(innerDivs).map(d => d.getAttribute('style') ?? '');
    expect(styles.some(s => s.includes('left: 75px'))).toBe(true);
    expect(styles.some(s => s.includes('left: 50px'))).toBe(true);
  });

  it('exceeds 6 nounIds — slice(0,6) caps DOM count', () => {
    const ids = Array.from({ length: 20 }, (_, i) => String(i + 1));
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('large numeric nounId (10000) renders correctly', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['10000']} />);
    expect(container.querySelector('[data-testid="niji-circular"]')?.textContent).toBe('10000');
  });

  it('"0" nounId renders as "0"', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['0']} />);
    expect(container.querySelector('[data-testid="niji-circular"]')?.textContent).toBe('0');
  });

  it('wrapper is single div regardless of nounIds count', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2', '3', '4', '5']} />);
    expect(container.children.length).toBe(1);
  });

  it('rerender from 2 to 4 nijis updates DOM count', () => {
    const { container, rerender } = render(<HorizontalStackedNijis nounIds={['1', '2']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(2);
    rerender(<HorizontalStackedNijis nounIds={['1', '2', '3', '4']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(4);
  });

  it('rerender from 10 to 3 nijis reduces DOM count', () => {
    const ids10 = Array.from({ length: 10 }, (_, i) => String(i + 1));
    const { container, rerender } = render(<HorizontalStackedNijis nounIds={ids10} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
    rerender(<HorizontalStackedNijis nounIds={['1', '2', '3']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(3);
  });

  it('inner div with left: 0px present for first niji', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1']} />);
    const innerDivs = container.querySelectorAll('div div');
    const styles = Array.from(innerDivs).map(d => d.getAttribute('style') ?? '');
    expect(styles.some(s => s.includes('left: 0px'))).toBe(true);
  });

  it('5 nijis renders left: 100px for 5th item', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2', '3', '4', '5']} />);
    const innerDivs = container.querySelectorAll('div div');
    const styles = Array.from(innerDivs).map(d => d.getAttribute('style') ?? '');
    expect(styles.some(s => s.includes('left: 100px'))).toBe(true);
  });

  it('multiple components render with independent DOM', () => {
    const { container } = render(
      <>
        <HorizontalStackedNijis nounIds={['1']} />
        <HorizontalStackedNijis nounIds={['2', '3']} />
      </>,
    );
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(3);
  });

  it('exact 6 nijis renders left: 125px for 6th item', () => {
    const { container } = render(
      <HorizontalStackedNijis nounIds={['1', '2', '3', '4', '5', '6']} />,
    );
    const innerDivs = container.querySelectorAll('div div');
    const styles = Array.from(innerDivs).map(d => d.getAttribute('style') ?? '');
    expect(styles.some(s => s.includes('left: 125px'))).toBe(true);
  });

  it('exactly 3 nounIds renders left: 0/25/50', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2', '3']} />);
    const innerDivs = container.querySelectorAll('div div');
    const styles = Array.from(innerDivs).map(d => d.getAttribute('style') ?? '');
    expect(styles.some(s => s.includes('left: 50px'))).toBe(true);
  });

  it('1000 nounIds caps at 6 elements', () => {
    const ids = Array.from({ length: 1000 }, (_, i) => String(i + 1));
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('renders nothing in DOM children when array empty', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={[]} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(0);
  });

  it('rerender from 3 to 6 nijis updates element count', () => {
    const { container, rerender } = render(<HorizontalStackedNijis nounIds={['1', '2', '3']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(3);
    rerender(<HorizontalStackedNijis nounIds={['1', '2', '3', '4', '5', '6']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('numeric-string nounIds render verbatim as text', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['100', '200']} />);
    const nijis = container.querySelectorAll('[data-testid="niji-circular"]');
    expect(nijis[0].textContent).toBe('200');
    expect(nijis[1].textContent).toBe('100');
  });

  it('renders 5 niji circles for 5 IDs', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2', '3', '4', '5']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(5);
  });

  it('renders exactly 6 (cap) for 100 IDs', () => {
    const ids = Array.from({ length: 100 }, (_, i) => String(i + 1));
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('rerender from 0 to 3 IDs adds elements', () => {
    const { container, rerender } = render(<HorizontalStackedNijis nounIds={[]} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(0);
    rerender(<HorizontalStackedNijis nounIds={['1', '2', '3']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(3);
  });

  it('renders multiple instances independently', () => {
    const { container } = render(
      <>
        <HorizontalStackedNijis nounIds={['1', '2']} />
        <HorizontalStackedNijis nounIds={['3', '4', '5']} />
      </>,
    );
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(5);
  });

  it('renders without crash for very long string IDs', () => {
    const longId = '9'.repeat(100);
    expect(() => render(<HorizontalStackedNijis nounIds={[longId]} />)).not.toThrow();
  });

  it('renders 4 IDs as 4 circles (under cap)', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2', '3', '4']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(4);
  });

  it('renders 6 IDs as exactly 6 circles (at cap)', () => {
    const { container } = render(
      <HorizontalStackedNijis nounIds={['1', '2', '3', '4', '5', '6']} />,
    );
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('renders 7 IDs caps at 6', () => {
    const { container } = render(
      <HorizontalStackedNijis nounIds={['1', '2', '3', '4', '5', '6', '7']} />,
    );
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('renders 10 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <HorizontalStackedNijis key={i} nounIds={[`${i}`]} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(10);
  });

  it('renders 3 IDs with 3 circles', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['42', '100', '200']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(3);
  });

  it('handles 50 instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <HorizontalStackedNijis key={i} nounIds={[`${i}`]} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(50);
  });

  it('handles 0 IDs renders empty (no circles)', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={[]} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(0);
  });

  it('handles 2 IDs renders 2 circles', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(2);
  });

  it('rerender from 1 to 5 IDs increases circles', () => {
    const { container, rerender } = render(<HorizontalStackedNijis nounIds={['1']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(1);
    rerender(<HorizontalStackedNijis nounIds={['1', '2', '3', '4', '5']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(5);
  });

  it('handles "9999" max IDs caps at 6', () => {
    const ids = Array.from({ length: 9999 }, (_, i) => String(i + 1));
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });

  it('renders 100 instances each independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <HorizontalStackedNijis key={i} nounIds={[`${i}`]} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(100);
  });

  it('handles 0 IDs renders empty wrapper', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={[]} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(0);
  });

  it('handles 5 IDs renders 5 circles (under cap)', () => {
    const { container } = render(<HorizontalStackedNijis nounIds={['1', '2', '3', '4', '5']} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(5);
  });

  it('rerender 20 times preserves DOM count', () => {
    const { container, rerender } = render(<HorizontalStackedNijis nounIds={['1']} />);
    for (let i = 0; i < 20; i++) {
      rerender(
        <HorizontalStackedNijis nounIds={Array.from({ length: i + 1 }, (_, j) => `${j}`)} />,
      );
      const expected = Math.min(i + 1, 6);
      expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(expected);
    }
  });

  it('handles 10000 IDs caps at 6 circles', () => {
    const ids = Array.from({ length: 10000 }, (_, i) => `${i}`);
    const { container } = render(<HorizontalStackedNijis nounIds={ids} />);
    expect(container.querySelectorAll('[data-testid="niji-circular"]').length).toBe(6);
  });
});
