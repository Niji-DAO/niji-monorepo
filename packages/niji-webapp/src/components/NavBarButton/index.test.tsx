import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import NavBarButton, { NavBarButtonStyle, getNavBarButtonVariant } from './index';

describe('getNavBarButtonVariant', () => {
  it('returns coolInfo class for COOL_INFO', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.COOL_INFO)).toMatch(/cool/i);
  });

  it('returns warmInfo class for WARM_INFO', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.WARM_INFO)).toMatch(/warm/i);
  });

  it('returns delegate class for DELEGATE_PRIMARY', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.DELEGATE_PRIMARY)).toMatch(/delegate/i);
  });

  it('returns FOR_VOTE_SUBMIT class', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.FOR_VOTE_SUBMIT)).toBeTruthy();
  });

  it('returns AGAINST_VOTE_SUBMIT class', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.AGAINST_VOTE_SUBMIT)).toBeTruthy();
  });

  it('returns ABSTAIN_VOTE_SUBMIT class', () => {
    expect(getNavBarButtonVariant(NavBarButtonStyle.ABSTAIN_VOTE_SUBMIT)).toBeTruthy();
  });
});

describe('NavBarButton', () => {
  it('renders buttonText content', () => {
    const { container } = render(<NavBarButton buttonText="Click me" />);
    expect(container.textContent).toContain('Click me');
  });

  it('renders buttonIcon when provided', () => {
    const { container } = render(
      <NavBarButton buttonText="x" buttonIcon={<span data-testid="icon" />} />,
    );
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('fires onClick when enabled', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="x" onClick={onClick} />);
    fireEvent.click(container.firstChild as Element);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders ChevronDown when isDropdown=true + isButtonUp=false', () => {
    const { container } = render(
      <NavBarButton buttonText="x" isDropdown={true} isButtonUp={false} />,
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('renders ChevronUp when isDropdown=true + isButtonUp=true', () => {
    const { container } = render(
      <NavBarButton buttonText="x" isDropdown={true} isButtonUp={true} />,
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('does NOT render chevron when isDropdown=false', () => {
    const { container } = render(<NavBarButton buttonText="x" isDropdown={false} />);
    expect(container.querySelectorAll('svg').length).toBe(0);
  });

  it('applies disabled class when disabled=true', () => {
    const { container } = render(<NavBarButton buttonText="x" disabled={true} />);
    const inner = container.querySelector('div div div');
    expect(inner?.className).toMatch(/disabled/i);
  });

  it('repeated onClick invokes handler N times', () => {
    const onClick = vi.fn();
    const { container } = render(<NavBarButton buttonText="x" onClick={onClick} />);
    const root = container.firstChild as Element;
    fireEvent.click(root);
    fireEvent.click(root);
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('renders both buttonText and buttonIcon', () => {
    const { container } = render(
      <NavBarButton buttonText="hello" buttonIcon={<span data-testid="icon" />} />,
    );
    expect(container.textContent).toContain('hello');
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull();
  });

  it('rerender updates buttonText', () => {
    const { container, rerender } = render(<NavBarButton buttonText="first" />);
    expect(container.textContent).toContain('first');
    rerender(<NavBarButton buttonText="second" />);
    expect(container.textContent).toContain('second');
  });

  it('isDropdown=true renders exactly 1 svg (chevron)', () => {
    const { container } = render(<NavBarButton buttonText="x" isDropdown={true} />);
    expect(container.querySelectorAll('svg').length).toBe(1);
  });

  it('disabled=false does NOT apply disabled class', () => {
    const { container } = render(<NavBarButton buttonText="x" disabled={false} />);
    const inner = container.querySelector('div div div');
    expect(inner?.className).not.toMatch(/disabled/i);
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <NavBarButton buttonText="a" />
        <NavBarButton buttonText="b" />
      </>,
    );
    expect(container.textContent).toContain('a');
    expect(container.textContent).toContain('b');
  });
});
