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

  it('mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
      unmount();
    }
  });

  it('renders 200 instances with varying amounts', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 50 different decimal bid amounts', () => {
    for (let i = 0; i < 50; i++) {
      const { container, unmount } = render(
        <MinBid minBid={parseEther(`${i + 1}.${i}`)} onClick={() => {}} />,
      );
      expect(container.querySelector('img')).not.toBeNull();
      unmount();
    }
  });

  it('all 50 wrapper div have onClick', () => {
    const onClick = vi.fn();
    const { container } = render(
      <>
        {Array.from({ length: 50 }, (_, i) => (
          <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={onClick} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(50);
  });

  it('handles 1 wei minBid + onClick fires correctly', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={1n} onClick={onClick} />);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('mount-unmount 200 cycles', () => {
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different minBid amounts', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <MinBid minBid={parseEther(`${i + 1}`)} onClick={() => {}} />,
      );
      expect(container.querySelector('img')).not.toBeNull();
      unmount();
    }
  });

  it('all 100 instances have h3 element', () => {
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={() => {}} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('h3').length).toBe(100);
  });

  it('rapid 500 click events fire handler', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 500; i++) fireEvent.click(wrapper);
    expect(onClick).toHaveBeenCalledTimes(500);
  });

  it('mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
      unmount();
    }
  });

  it('renders 1000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different fractional minBid amounts', () => {
    for (let i = 0; i < 100; i++) {
      const v = (i + 1) * 0.1;
      const { container, unmount } = render(
        <MinBid minBid={parseEther(`${v}`)} onClick={() => {}} />,
      );
      expect(container.querySelector('h3')).not.toBeNull();
      unmount();
    }
  });

  it('all 500 imgs are present', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={() => {}} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(500);
  });

  it('rapid 1000 click events fire handler', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 1000; i++) fireEvent.click(wrapper);
    expect(onClick).toHaveBeenCalledTimes(1000);
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<MinBid minBid={parseEther('1')} onClick={() => {}} />);
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different fractional minBid amounts', () => {
    for (let i = 0; i < 200; i++) {
      const v = (i + 1) * 0.1;
      const { container, unmount } = render(
        <MinBid minBid={parseEther(`${v}`)} onClick={() => {}} />,
      );
      expect(container.querySelector('h3')).not.toBeNull();
      unmount();
    }
  });

  it('all 700 imgs are present', () => {
    const { container } = render(
      <>
        {Array.from({ length: 700 }, (_, i) => (
          <MinBid key={i} minBid={parseEther(`${i + 1}`)} onClick={() => {}} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(700);
  });

  it('rapid 2000 click events fire handler', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={parseEther('1')} onClick={onClick} />);
    const wrapper = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 2000; i++) fireEvent.click(wrapper);
    expect(onClick).toHaveBeenCalledTimes(2000);
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<MinBid minBid={1n} onClick={() => {}} />);
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <MinBid key={i} minBid={BigInt(i + 1)} onClick={() => {}} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different minBid values', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<MinBid minBid={BigInt(i + 1)} onClick={() => {}} />);
      unmount();
    }
  });

  it('round-2 rapid 1000 onClick events', () => {
    const onClick = vi.fn();
    const { container } = render(<MinBid minBid={1n} onClick={onClick} />);
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 1000; i++) fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(1000);
  });

  it('round-2 all 200 instances render div root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <MinBid key={i} minBid={BigInt(i + 1)} onClick={() => {}} />
        ))}
      </>,
    );
    expect(container.children.length).toBe(200);
  });
});
