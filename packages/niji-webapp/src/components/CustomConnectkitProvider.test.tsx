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
});
