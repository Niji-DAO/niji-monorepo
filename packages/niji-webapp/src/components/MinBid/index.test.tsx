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
});
