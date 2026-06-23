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
});
