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

  it('rerender from minBid > 0 to 0n hides amount', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ');
    rerender(<MinBid minBid={0n} onClick={() => {}} />);
    expect(container.textContent).not.toContain('Ξ');
  });

  it('img tag count remains 1 across rerenders', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    rerender(<MinBid minBid={parseEther('5')} onClick={() => {}} />);
    rerender(<MinBid minBid={parseEther('10')} onClick={() => {}} />);
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <MinBid minBid={parseEther('1')} onClick={() => {}} />
        <MinBid minBid={parseEther('5')} onClick={() => {}} />
      </>,
    );
    expect(container.textContent).toContain('1.00');
    expect(container.textContent).toContain('5.00');
  });

  it('onClick handler captures click event', () => {
    let receivedEvent: { type?: string } | null = null;
    const onClick = vi.fn((e: { type: string }) => {
      receivedEvent = e;
    });
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.querySelector('div');
    if (wrapper) fireEvent.click(wrapper);
    expect(receivedEvent).not.toBeNull();
    expect((receivedEvent as unknown as { type: string }).type).toBe('click');
  });

  it('1 wei minBid is treated as truthy and renders amount', () => {
    const { container } = render(<MinBid minBid={1n} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ');
  });

  it('h3 element contains the message text', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelector('h3')?.textContent).toContain('You must bid at least');
  });

  it('img exists in container DOM', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('repeated clicks invoke onClick 5 times', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.querySelector('div');
    if (wrapper) {
      for (let i = 0; i < 5; i++) fireEvent.click(wrapper);
    }
    expect(onClick).toHaveBeenCalledTimes(5);
  });

  it('renders exactly 1 div wrapper', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.children.length).toBe(1);
  });

  it('renders without crash for fractional 0.001 ETH', () => {
    expect(() => render(<MinBid minBid={parseEther('0.001')} onClick={() => {}} />)).not.toThrow();
  });

  it('img src is full noun-pointer.png URL', () => {
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('noun-pointer.png');
  });

  it('rapid 5 clicks invoke onClick 5 times', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const div = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 5; i++) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(5);
  });

  it('renders for large minBid (1000 ETH)', () => {
    const { container } = render(<MinBid minBid={parseEther('1000')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ 1000.00');
  });

  it('rerender from 1 to 5 ETH updates amount', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ 1.00');
    rerender(<MinBid minBid={parseEther('5')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ 5.00');
  });

  it('renders without crash with fractional minBid (0.123)', () => {
    expect(() => render(<MinBid minBid={parseEther('0.123')} onClick={() => {}} />)).not.toThrow();
  });

  it('renders multiple instances independently', () => {
    const { container } = render(
      <>
        <MinBid minBid={parseEther('1')} onClick={() => {}} />
        <MinBid minBid={parseEther('2')} onClick={() => {}} />
      </>,
    );
    expect(container.textContent).toContain('Ξ 1.00');
    expect(container.textContent).toContain('Ξ 2.00');
  });

  it('renders 10 instances each with own onClick', () => {
    const handlers = Array.from({ length: 10 }, () => vi.fn());
    const { container } = render(
      <>
        {handlers.map((h, i) => (
          <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={h} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(10);
  });

  it('rapid 20 clicks fire 20 times', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 20; i++) fireEvent.click(wrapper);
    expect(onClick).toHaveBeenCalledTimes(20);
  });

  it('rerender from 0 to 1 ETH shows amount', () => {
    const { container, rerender } = render(<MinBid minBid={0n} onClick={() => {}} />);
    expect(container.textContent).not.toContain('Ξ');
    rerender(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ 1.00');
  });

  it('renders very small fractional 0.001 ETH', () => {
    const { container } = render(<MinBid minBid={parseEther('0.001')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ');
  });

  it('img element preserved across rerenders', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelector('img')).not.toBeNull();
    rerender(<MinBid minBid={parseEther('5')} onClick={() => {}} />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('renders 20 MinBid instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 20 }, (_, i) => (
          <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={vi.fn()} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(20);
  });

  it('renders for boundary 1 wei (smallest positive)', () => {
    const { container } = render(<MinBid minBid={1n} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ');
  });

  it('rerender from 0n to fractional ETH', () => {
    const { container, rerender } = render(<MinBid minBid={0n} onClick={() => {}} />);
    expect(container.textContent).not.toContain('Ξ 0.50');
    rerender(<MinBid minBid={parseEther('0.5')} onClick={() => {}} />);
    expect(container.textContent).toContain('Ξ 0.50');
  });

  it('img alt attribute consistent across renders', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    const alt1 = container.querySelector('img')?.getAttribute('alt');
    rerender(<MinBid minBid={parseEther('5')} onClick={() => {}} />);
    expect(container.querySelector('img')?.getAttribute('alt')).toBe(alt1);
  });

  it('h3 element preserved across rerenders', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    expect(container.querySelector('h3')).not.toBeNull();
    rerender(<MinBid minBid={parseEther('100')} onClick={() => {}} />);
    expect(container.querySelector('h3')).not.toBeNull();
  });

  it('renders 50 MinBid instances independently', () => {
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={vi.fn()} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(50);
  });

  it('rapid 100 clicks invoke onClick 100 times', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 100; i++) fireEvent.click(wrapper);
    expect(onClick).toHaveBeenCalledTimes(100);
  });

  it('rerender 20 times preserves img + h3', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    for (let i = 1; i <= 20; i++) {
      rerender(<MinBid minBid={parseEther(`${i}`)} onClick={() => {}} />);
      expect(container.querySelector('img')).not.toBeNull();
      expect(container.querySelector('h3')).not.toBeNull();
    }
  });

  it('handles boundary 1 wei + huge bid', () => {
    expect(() => render(<MinBid minBid={1n} onClick={() => {}} />)).not.toThrow();
    expect(() =>
      render(
        <MinBid minBid={BigInt('1000000000000000000000000') /* 1M ETH */} onClick={() => {}} />,
      ),
    ).not.toThrow();
  });

  it('img element preserved across 30 rerenders', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    for (let i = 0; i < 30; i++) {
      rerender(<MinBid minBid={parseEther(`${i + 1}`)} onClick={() => {}} />);
      expect(container.querySelectorAll('img').length).toBe(1);
    }
  });

  it('renders 100 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('rapid 100 onClick events fire handler', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.querySelector('div')!;
    for (let i = 0; i < 100; i++) fireEvent.click(wrapper);
    expect(onClick).toHaveBeenCalledTimes(100);
  });

  it('rerender 30 times preserves img', () => {
    const { container, rerender } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
    for (let i = 0; i < 30; i++) {
      rerender(<MinBid minBid={parseEther(`${i + 1}.5`)} onClick={() => {}} />);
    }
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('handles 1 wei minBid (very small amount)', () => {
    const { container } = render(<MinBid minBid={1n} onClick={() => {}} />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('handles all 100 imgs in single mount', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={() => {}} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(100);
  });
});
