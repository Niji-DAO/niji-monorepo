import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/NijisTransition', () => ({
  default: ({
    show,
    children,
    className,
  }: {
    show: boolean;
    children?: React.ReactNode;
    className?: string;
  }) =>
    show ? (
      <div className={className} data-testid="transition">
        {children}
      </div>
    ) : null,
}));

vi.mock('@/utils/cssTransitionUtils', () => ({
  basicFadeInOut: {},
  desktopModalSlideInFromTopAndGrow: {},
  mobileModalSlideInFromBottm: {},
}));

vi.mock('@/utils/isMobile', () => ({
  isMobileScreen: () => false,
}));

import SolidColorBackgroundModal, { Backdrop } from './index';

beforeEach(() => {
  document.body.innerHTML =
    '<div id="root"></div><div id="backdrop-root"></div><div id="overlay-root"></div>';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Backdrop', () => {
  it('does not render when show=false', () => {
    const { container } = render(<Backdrop show={false} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).toBeNull();
  });

  it('renders when show=true', () => {
    const { container } = render(<Backdrop show={true} onDismiss={() => {}} />);
    expect(container.querySelector('[data-testid="transition"]')).not.toBeNull();
  });
});

describe('SolidColorBackgroundModal', () => {
  it('portals into backdrop-root + overlay-root', () => {
    render(<SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>x</p>} />);
    expect(document.getElementById('backdrop-root')?.children.length).toBe(1);
    expect((document.getElementById('overlay-root')?.children.length ?? 0) > 0).toBe(true);
  });

  it('does not show content when show=false', () => {
    render(<SolidColorBackgroundModal show={false} onDismiss={() => {}} content={<p>x</p>} />);
    // NijisTransition mock で show=false は null を返すので overlay-root.children は空
    expect(document.getElementById('overlay-root')?.querySelector('p')).toBeNull();
  });

  it('renders content when show=true', () => {
    render(
      <SolidColorBackgroundModal show={true} onDismiss={() => {}} content={<p>my content</p>} />,
    );
    expect(document.getElementById('overlay-root')?.querySelector('p')?.textContent).toBe(
      'my content',
    );
  });

  it('fires onDismiss on close button click', () => {
    const onDismiss = vi.fn();
    render(<SolidColorBackgroundModal show={true} onDismiss={onDismiss} content={null} />);
    const btn = document.getElementById('overlay-root')?.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
