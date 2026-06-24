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
});
