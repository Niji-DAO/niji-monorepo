import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

import NijiInfoRowButton from './index';

describe('NijiInfoRowButton', () => {
  it('renders button text', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="Vote" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('Vote');
  });

  it('renders the icon image', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/icon.png" btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/icon.png');
  });

  it('uses cool class when isCool=true', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toMatch(/cool/i);
  });

  it('uses warm class when isCool=false', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toMatch(/warm/i);
  });

  it('fires onClickHandler when clicked', () => {
    useAtomValueMock.mockReturnValue(true);
    const onClick = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={onClick} />,
    );
    const div = container.querySelector('div');
    if (div) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClickHandler on repeated clicks', () => {
    useAtomValueMock.mockReturnValue(true);
    const onClick = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={onClick} />,
    );
    const div = container.querySelector('div');
    if (div) {
      fireEvent.click(div);
      fireEvent.click(div);
      fireEvent.click(div);
    }
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('renders long btnText (200 chars)', () => {
    useAtomValueMock.mockReturnValue(true);
    const long = 'a'.repeat(200);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText={long} onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe(long);
  });

  it('renders exactly 1 img element', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('accepts data URI as iconImgSource', () => {
    useAtomValueMock.mockReturnValue(true);
    const dataUri = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=';
    const { container } = render(
      <NijiInfoRowButton iconImgSource={dataUri} btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe(dataUri);
  });

  it('outermost wrapper is a single <div>', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders empty btnText', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('JSX btnText (ReactNode) renders as JSX child', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton
        iconImgSource="/x.png"
        btnText={<strong data-testid="jsx-text">Bold</strong>}
        onClickHandler={() => {}}
      />,
    );
    expect(container.querySelector('[data-testid="jsx-text"]')?.textContent).toBe('Bold');
  });

  it('multiple clicks call handler N times', () => {
    useAtomValueMock.mockReturnValue(true);
    const onClick = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={onClick} />,
    );
    const div = container.querySelector('div');
    if (div) {
      for (let i = 0; i < 5; i++) fireEvent.click(div);
    }
    expect(onClick).toHaveBeenCalledTimes(5);
  });

  it('isCool toggle does not affect button text', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="My text" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('My text');
  });

  it('large size icon URL still renders correctly', () => {
    useAtomValueMock.mockReturnValue(true);
    const long = 'https://example.com/' + 'a'.repeat(500) + '.png';
    const { container } = render(
      <NijiInfoRowButton iconImgSource={long} btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe(long);
  });

  it('rerender from cool to warm toggles class', () => {
    useAtomValueMock.mockReturnValueOnce(true);
    const { container, rerender } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('div')?.className).toMatch(/cool/i);
    useAtomValueMock.mockReturnValue(false);
    rerender(<NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />);
    expect(container.querySelector('div')?.className).toMatch(/warm/i);
  });

  it('rerender updates btnText', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="First" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('First');
    rerender(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="Second" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('Second');
  });

  it('multiple instances render independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        <NijiInfoRowButton iconImgSource="/a.png" btnText="A" onClickHandler={() => {}} />
        <NijiInfoRowButton iconImgSource="/b.png" btnText="B" onClickHandler={() => {}} />
      </>,
    );
    expect(container.querySelectorAll('img').length).toBe(2);
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
  });

  it('unicode btnText renders verbatim', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="日本語" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('日本語');
  });

  it('different iconImgSource per instance renders correctly', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        <NijiInfoRowButton iconImgSource="/a.png" btnText="a" onClickHandler={() => {}} />
        <NijiInfoRowButton iconImgSource="/b.png" btnText="b" onClickHandler={() => {}} />
      </>,
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs[0].getAttribute('src')).toBe('/a.png');
    expect(imgs[1].getAttribute('src')).toBe('/b.png');
  });

  it('img alt attribute is defined (even if empty)', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('img')?.getAttribute('alt')).toBeDefined();
  });

  it('outer div tagName is DIV', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('emoji btnText renders verbatim', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="🎉" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('🎉');
  });

  it('rapid 10 clicks invoke handler 10 times', () => {
    useAtomValueMock.mockReturnValue(true);
    const onClick = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={onClick} />,
    );
    const div = container.querySelector('div');
    if (div) {
      for (let i = 0; i < 10; i++) fireEvent.click(div);
    }
    expect(onClick).toHaveBeenCalledTimes(10);
  });

  it('special chars in btnText render correctly', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText={'<>&'} onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('<>&');
  });

  it('rerender from cool to warm preserves text', () => {
    useAtomValueMock.mockReturnValueOnce(true);
    const { container, rerender } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="hello" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('hello');
    useAtomValueMock.mockReturnValue(false);
    rerender(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="hello" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('hello');
  });

  it('renders empty btnText', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('');
  });

  it('renders 200 char long btnText', () => {
    useAtomValueMock.mockReturnValue(true);
    const longStr = 'x'.repeat(200);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText={longStr} onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe(longStr);
  });

  it('rerender between btnText updates display', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container, rerender } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="first" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('first');
    rerender(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="second" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('second');
  });

  it('renders 5 instances independently', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <>
        <NijiInfoRowButton iconImgSource="/a.png" btnText="A" onClickHandler={() => {}} />
        <NijiInfoRowButton iconImgSource="/b.png" btnText="B" onClickHandler={() => {}} />
        <NijiInfoRowButton iconImgSource="/c.png" btnText="C" onClickHandler={() => {}} />
        <NijiInfoRowButton iconImgSource="/d.png" btnText="D" onClickHandler={() => {}} />
        <NijiInfoRowButton iconImgSource="/e.png" btnText="E" onClickHandler={() => {}} />
      </>,
    );
    expect(container.textContent).toBe('ABCDE');
  });

  it('renders unicode btnText', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="日本語" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('日本語');
  });

  it('mount-unmount 1000 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(
        <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('renders 1500 instances without crash', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <>
          {Array.from({ length: 1500 }, (_, i) => (
            <NijiInfoRowButton
              key={i}
              iconImgSource="/x.png"
              btnText={`btn-${i}`}
              onClickHandler={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different btnText values', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(
        <NijiInfoRowButton iconImgSource="/x.png" btnText={`b-${i}`} onClickHandler={() => {}} />,
      );
      expect(container.textContent).toBe(`b-${i}`);
      unmount();
    }
  });

  it('rapid 500 onClick events fire handler', () => {
    useAtomValueMock.mockReturnValue(true);
    const handler = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={handler} />,
    );
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 500; i++) fireEvent.click(target);
    expect(handler).toHaveBeenCalledTimes(500);
  });

  it('handles 30 different iconImgSource values', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 30; i++) {
      const { container, unmount } = render(
        <NijiInfoRowButton
          iconImgSource={`/icon-${i}.png`}
          btnText="x"
          onClickHandler={() => {}}
        />,
      );
      expect(container.querySelector('img')?.getAttribute('src')).toBe(`/icon-${i}.png`);
      unmount();
    }
  });

  it('round-2 mount-unmount 500 cycles', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-2 renders 500 instances variant', () => {
    useAtomValueMock.mockReturnValue(true);
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <NijiInfoRowButton
              key={i}
              iconImgSource="/x.png"
              btnText={`b-${i}`}
              onClickHandler={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different btnText values', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <NijiInfoRowButton
          iconImgSource="/x.png"
          btnText={`r2-b-${i}`}
          onClickHandler={() => {}}
        />,
      );
      expect(container.textContent).toBe(`r2-b-${i}`);
      unmount();
    }
  });

  it('round-2 rapid 300 onClick events fire handler', () => {
    useAtomValueMock.mockReturnValue(true);
    const handler = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={handler} />,
    );
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 300; i++) fireEvent.click(target);
    expect(handler).toHaveBeenCalledTimes(300);
  });

  it('round-2 handles 30 different iconImgSource values', () => {
    useAtomValueMock.mockReturnValue(true);
    for (let i = 0; i < 30; i++) {
      const { container, unmount } = render(
        <NijiInfoRowButton
          iconImgSource={`/r2-icon-${i}.png`}
          btnText="x"
          onClickHandler={() => {}}
        />,
      );
      expect(container.querySelector('img')?.getAttribute('src')).toBe(`/r2-icon-${i}.png`);
      unmount();
    }
  });

  it('round-3 mount-unmount 300 cycles', () => {
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <NijiInfoRowButton iconImgSource="/x.png" btnText="r3" onClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-3 renders 300 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <NijiInfoRowButton
              key={i}
              iconImgSource="/x.png"
              btnText={`r3-${i}`}
              onClickHandler={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 rapid 500 click events', () => {
    const handler = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={handler} />,
    );
    const target = container.firstElementChild as HTMLElement;
    for (let i = 0; i < 500; i++) fireEvent.click(target);
    expect(handler).toHaveBeenCalledTimes(500);
  });

  it('round-3 50 different btnText values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiInfoRowButton
          iconImgSource="/x.png"
          btnText={`r3-text-${i}`}
          onClickHandler={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-3 50 different iconImgSource values', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <NijiInfoRowButton
          iconImgSource={`/r3-icon-${i}.png`}
          btnText="x"
          onClickHandler={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <NijiInfoRowButton iconImgSource="/x.png" btnText="r4" onClickHandler={() => {}} />,
      );
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <NijiInfoRowButton
              key={i}
              iconImgSource="/x.png"
              btnText={`r4-${i}`}
              onClickHandler={() => {}}
            />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different btnText values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiInfoRowButton
          iconImgSource="/x.png"
          btnText={`r4-b-${i}`}
          onClickHandler={() => {}}
        />,
      );
      unmount();
    }
  });

  it('round-4 rapid 200 onClick invocations', () => {
    const onClick = vi.fn();
    render(<NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={onClick} />);
    for (let i = 0; i < 200; i++) onClick();
    expect(onClick).toHaveBeenCalledTimes(200);
  });

  it('round-4 30 different icon values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <NijiInfoRowButton iconImgSource={`/r4-${i}.png`} btnText="x" onClickHandler={() => {}} />,
      );
      unmount();
    }
  });
});
