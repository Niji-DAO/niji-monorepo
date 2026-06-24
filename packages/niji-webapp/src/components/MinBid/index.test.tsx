import { fireEvent, render } from '@testing-library/react';
import { parseEther } from 'viem';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/assets/noun-pointer.png', () => ({
  default: 'noun-pointer.png',
}));

import MinBid from './index';

describe('MinBid', () => {
  it('renders bid amount via TruncatedAmount when minBid > 0', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ 1.00');
    expect(container.textContent).toContain('You must bid at least');
  });

  it('omits amount when minBid = 0n (falsy guard)', () => {
    const { container } = render(<MinBid minBid={0n} onClick={() => {}} />);
    expect(container.textContent).not.toContain('Ξ');
    expect(container.textContent).toContain('You must bid at least');
  });

  it('renders pointer image', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('fires onClick on wrapper click', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.querySelector('div');
    if (wrapper) fireEvent.click(wrapper);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handles very large minBid (1M ETH = 1e24 wei)', () => {
    const { container } = render(<MinBid minBid={parseEther('1000000')} onClick={() => {}} />);
    expect(container.textContent).toContain('You must bid at least');
    expect(container.textContent).toContain('Ξ');
  });

  it('fires onClick multiple times for repeated clicks', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.querySelector('div');
    if (wrapper) {
      fireEvent.click(wrapper);
      fireEvent.click(wrapper);
      fireEvent.click(wrapper);
    }
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('img alt is "Pointer noun"', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('Pointer noun');
  });

  it('renders exactly 1 h3 element', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelectorAll('h3').length).toBe(1);
  });

  it('outermost wrapper is single <div> with onClick handler', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('img src is the noun-pointer.png asset', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('noun-pointer.png');
  });

  it('renders fractional minBid (0.5 ETH)', () => {
    const { container } = render(<MinBid minBid={parseEther('0.5')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ 0.50');
  });

  it('renders 1 img element exactly', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('You must bid text exists for both minBid=0 and minBid>0', () => {
    const { container: c1 } = render(<MinBid minBid={0n} onClick={() => {}} />);
    const { container: c2 } = render(<MinBid minBid={parseEther('5')} onClick={() => {}} />);
    expect(c1.textContent).toContain('You must bid at least');
    expect(c2.textContent).toContain('You must bid at least');
  });

  it('rerender updates displayed minBid', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ 1.00');
    rerender(<MinBid minBid={parseEther('2')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ 2.00');
  });
});
