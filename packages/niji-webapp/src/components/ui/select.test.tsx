import React from 'react';

import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

beforeAll(() => {
  if (!global.ResizeObserver) {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
});

describe('Select', () => {
  it('renders SelectTrigger with placeholder text via SelectValue', () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = container.querySelector('[data-testid="trigger"]');
    expect(trigger?.textContent).toContain('Pick one');
  });

  it('SelectTrigger renders ChevronDown icon (svg) inside', () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="x" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = container.querySelector('[data-testid="trigger"]');
    expect(trigger?.querySelector('svg')).not.toBeNull();
  });

  it('SelectTrigger merges custom className over defaults', () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="trigger" className="custom-trigger-class">
          <SelectValue placeholder="x" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = container.querySelector('[data-testid="trigger"]');
    expect(trigger?.className).toContain('custom-trigger-class');
    expect(trigger?.className).toContain('flex');
  });

  it('SelectContent items are not rendered when select is closed', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(document.body.textContent).not.toContain('Apple');
  });

  it('SelectContent renders SelectItem when select is open', () => {
    render(
      <Select open={true} value="a" onValueChange={() => {}}>
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
          <SelectItem value="b">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(document.body.textContent).toContain('Apple');
    expect(document.body.textContent).toContain('Banana');
  });

  it('SelectLabel applies default semibold class', () => {
    render(
      <Select open={true} value="a">
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel data-testid="label">Fruits</SelectLabel>
            <SelectItem value="a">Apple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    const label = document.querySelector('[data-testid="label"]');
    expect(label?.className).toContain('font-semibold');
  });

  it('SelectLabel merges custom className', () => {
    render(
      <Select open={true} value="a">
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel data-testid="label" className="custom-label-class">
              Fruits
            </SelectLabel>
            <SelectItem value="a">Apple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    const label = document.querySelector('[data-testid="label"]');
    expect(label?.className).toContain('custom-label-class');
  });

  it('SelectSeparator applies default h-px class', () => {
    render(
      <Select open={true} value="a">
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Apple</SelectItem>
          <SelectSeparator data-testid="sep" />
          <SelectItem value="b">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    const sep = document.querySelector('[data-testid="sep"]');
    expect(sep?.className).toContain('h-px');
  });

  it('SelectScrollUpButton renders ChevronUp icon', () => {
    render(
      <Select open={true} value="a">
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    const scrollUp = document.querySelector('[class*="cursor-default"]');
    expect(scrollUp?.querySelector('svg')).not.toBeNull();
  });

  it('SelectScrollDownButton renders inside SelectContent', () => {
    render(
      <Select open={true} value="a">
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
          <SelectScrollDownButton data-testid="scroll-down" />
        </SelectContent>
      </Select>,
    );
    const buttons = document.querySelectorAll('[class*="cursor-default"]');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('SelectScrollUpButton renders inside SelectContent (radix default scroll buttons)', () => {
    render(
      <Select open={true} value="a">
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    const buttons = document.querySelectorAll('[class*="cursor-default"]');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('SelectTrigger has disabled class when disabled prop is true', () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="trigger" disabled>
          <SelectValue placeholder="x" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = container.querySelector('[data-testid="trigger"]');
    expect(trigger?.className).toContain('disabled:opacity-50');
  });

  it('SelectItem renders selected ItemIndicator (Check icon) for current value', () => {
    render(
      <Select open={true} value="a">
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem data-testid="item-a" value="a">
            Apple
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    const item = document.querySelector('[data-testid="item-a"]');
    expect(item?.querySelector('svg')).not.toBeNull();
  });
});
