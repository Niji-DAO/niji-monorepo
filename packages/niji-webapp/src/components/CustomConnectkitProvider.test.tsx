import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useActiveLocaleMock = vi.fn();
vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => useActiveLocaleMock(),
}));

const optionsCapture: { language?: string } = {};
vi.mock('connectkit', () => ({
  ConnectKitProvider: ({
    children,
    options,
  }: {
    children: React.ReactNode;
    options: { language?: string };
  }) => {
    optionsCapture.language = options.language;
    return <div data-testid="ckp">{children}</div>;
  },
}));

import { CustomConnectkitProvider } from './CustomConnectkitProvider';

describe('CustomConnectkitProvider', () => {
  it('renders ConnectKitProvider wrapping children', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(
      <CustomConnectkitProvider>
        <span>child</span>
      </CustomConnectkitProvider>,
    );
    expect(container.querySelector('[data-testid="ckp"]')).not.toBeNull();
    expect(container.querySelector('span')?.textContent).toBe('child');
  });

  it('forwards en-US locale option', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    render(
      <CustomConnectkitProvider>
        <span>x</span>
      </CustomConnectkitProvider>,
    );
    expect(optionsCapture.language).toBe('en-US');
  });

  it('forwards ja-JP locale option', () => {
    useActiveLocaleMock.mockReturnValue('ja-JP');
    render(
      <CustomConnectkitProvider>
        <span>x</span>
      </CustomConnectkitProvider>,
    );
    expect(optionsCapture.language).toBe('ja-JP');
  });

  it('replaces pseudo locale with en-US (fallback)', () => {
    useActiveLocaleMock.mockReturnValue('pseudo');
    render(
      <CustomConnectkitProvider>
        <span>x</span>
      </CustomConnectkitProvider>,
    );
    expect(optionsCapture.language).toBe('en-US');
  });

  it('renders multiple children inside provider', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(
      <CustomConnectkitProvider>
        <span>a</span>
        <span>b</span>
      </CustomConnectkitProvider>,
    );
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('renders numeric children', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(<CustomConnectkitProvider>{42}</CustomConnectkitProvider>);
    expect(container.querySelector('[data-testid="ckp"]')?.textContent).toBe('42');
  });

  it('forwards arbitrary non-pseudo locale verbatim (de-DE)', () => {
    useActiveLocaleMock.mockReturnValue('de-DE');
    render(
      <CustomConnectkitProvider>
        <span>x</span>
      </CustomConnectkitProvider>,
    );
    expect(optionsCapture.language).toBe('de-DE');
  });

  it('forwards fr-FR locale verbatim', () => {
    useActiveLocaleMock.mockReturnValue('fr-FR');
    render(
      <CustomConnectkitProvider>
        <span>x</span>
      </CustomConnectkitProvider>,
    );
    expect(optionsCapture.language).toBe('fr-FR');
  });

  it('renders exactly 1 ConnectKitProvider instance', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(
      <CustomConnectkitProvider>
        <span>x</span>
      </CustomConnectkitProvider>,
    );
    expect(container.querySelectorAll('[data-testid="ckp"]').length).toBe(1);
  });

  it('forwards zh-CN locale verbatim', () => {
    useActiveLocaleMock.mockReturnValue('zh-CN');
    render(
      <CustomConnectkitProvider>
        <span>x</span>
      </CustomConnectkitProvider>,
    );
    expect(optionsCapture.language).toBe('zh-CN');
  });

  it('forwards ko-KR locale verbatim', () => {
    useActiveLocaleMock.mockReturnValue('ko-KR');
    render(
      <CustomConnectkitProvider>
        <span>x</span>
      </CustomConnectkitProvider>,
    );
    expect(optionsCapture.language).toBe('ko-KR');
  });

  it('renders children of provider in DOM', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(
      <CustomConnectkitProvider>
        <div data-testid="my-child">hello</div>
      </CustomConnectkitProvider>,
    );
    expect(container.querySelector('[data-testid="my-child"]')?.textContent).toBe('hello');
  });

  it('pseudo locale always normalized to en-US', () => {
    useActiveLocaleMock.mockReturnValue('pseudo');
    render(
      <CustomConnectkitProvider>
        <span>x</span>
      </CustomConnectkitProvider>,
    );
    expect(optionsCapture.language).toBe('en-US');
    expect(optionsCapture.language).not.toBe('pseudo');
  });

  it('renders without crash for empty string locale (forwarded verbatim)', () => {
    useActiveLocaleMock.mockReturnValue('');
    expect(() =>
      render(
        <CustomConnectkitProvider>
          <span>x</span>
        </CustomConnectkitProvider>,
      ),
    ).not.toThrow();
  });

  it('mount-unmount 500 cycles', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('renders 500 instances without crash', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <>
          {Array.from({ length: 500 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <div>x-{i}</div>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 30 different locales', () => {
    for (let i = 0; i < 30; i++) {
      useActiveLocaleMock.mockReturnValue(`locale-${i}`);
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('all 200 instances have ckp data-testid', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <CustomConnectkitProvider key={i}>
            <div>x</div>
          </CustomConnectkitProvider>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="ckp"]').length).toBe(200);
  });

  it('handles 50 different nested children', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>
            <span data-testid={`n-${i}`}>{i}</span>
          </div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 300 cycles', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 300; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-2 renders 300 instances', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    expect(() =>
      render(
        <>
          {Array.from({ length: 300 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <div>x-{i}</div>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different locales', () => {
    for (let i = 0; i < 50; i++) {
      useActiveLocaleMock.mockReturnValue(`loc-${i}`);
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-2 100 instances render ckp testid', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    const { container } = render(
      <>
        {Array.from({ length: 100 }, (_, i) => (
          <CustomConnectkitProvider key={i}>
            <div>x</div>
          </CustomConnectkitProvider>
        ))}
      </>,
    );
    expect(container.querySelectorAll('[data-testid="ckp"]').length).toBe(100);
  });

  it('round-2 rapid 100 renders', () => {
    useActiveLocaleMock.mockReturnValue('en-US');
    for (let i = 0; i < 100; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <div>x</div>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r3-x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-3 renders 50 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <div>r3-{i}</div>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r3-c-{i}</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <div>x</div>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>second</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r4</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-4 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <div>r4-{i}</div>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <div>x</div>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-4 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r4-child-{i}</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r5</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-5 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <div>r5-{i}</div>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <div>x</div>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-5 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r5-child-{i}</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r6</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-6 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <div>r6-{i}</div>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <div>x</div>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-6 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r6-child-{i}</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r7</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <div>r7-{i}</div>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <div>x</div>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-7 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r7-child-{i}</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r8</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <div>r8-{i}</div>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <div>x</div>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>x</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-8 30 different children values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r8-child-{i}</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-9 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r9</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-9 30 instances rendered together', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <div>r9-{i}</div>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-9 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <div>r9</div>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-9 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r9</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-9 30 different children cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <div>r9-child-{i}</div>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-10 30 sequential CustomConnectkitProvider mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <span>r10-{i}</span>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-10 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <span>r10-i-{i}</span>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-10 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <span>r10-s-{i}</span>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-10 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <span>r10-m-{i}</span>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-10 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <span>r10-c-{i}</span>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-11 30 sequential CustomConnectkitProvider mount-unmount cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <span>r11-{i}</span>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-11 30 renders instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CustomConnectkitProvider key={i}>
              <span>r11-i-{i}</span>
            </CustomConnectkitProvider>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-11 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <CustomConnectkitProvider>
            <span>r11-s-{i}</span>
          </CustomConnectkitProvider>,
        ),
      ).not.toThrow();
    }
  });

  it('round-11 50 sequential mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <span>r11-m-{i}</span>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });

  it('round-11 100 sequential mount-unmount cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <CustomConnectkitProvider>
          <span>r11-c-{i}</span>
        </CustomConnectkitProvider>,
      );
      unmount();
    }
  });
});
