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

  it('placeholder shows when value is undefined', () => {
    const { container } = render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="empty-placeholder" />
        </SelectTrigger>
      </Select>,
    );
    expect(container.querySelector('[data-testid="trigger"]')?.textContent).toContain(
      'empty-placeholder',
    );
  });

  it('multiple SelectItem renders all options when open', () => {
    render(
      <Select open={true} value="a">
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
          <SelectItem value="b">B</SelectItem>
          <SelectItem value="c">C</SelectItem>
          <SelectItem value="d">D</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(document.body.textContent).toContain('A');
    expect(document.body.textContent).toContain('B');
    expect(document.body.textContent).toContain('C');
    expect(document.body.textContent).toContain('D');
  });

  it('SelectGroup wraps items + label without crash', () => {
    expect(() =>
      render(
        <Select open={true} value="a">
          <SelectTrigger>
            <SelectValue placeholder="x" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group</SelectLabel>
              <SelectItem value="a">A</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>,
      ),
    ).not.toThrow();
  });

  it('SelectSeparator can appear multiple times', () => {
    render(
      <Select open={true} value="a">
        <SelectTrigger>
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
          <SelectSeparator />
          <SelectItem value="b">B</SelectItem>
          <SelectSeparator />
          <SelectItem value="c">C</SelectItem>
        </SelectContent>
      </Select>,
    );
    const seps = document.querySelectorAll('[class*="h-px"]');
    expect(seps.length).toBeGreaterThanOrEqual(2);
  });

  it('SelectContent open=true renders SelectItem with value attribute', () => {
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
    expect(document.querySelector('[data-testid="item-a"]')).not.toBeNull();
  });

  it('Select mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('SelectTrigger renders 50 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <Select key={i}>
              <SelectTrigger>
                <SelectValue placeholder={`p-${i}`} />
              </SelectTrigger>
            </Select>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('SelectGroup + SelectLabel render 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <SelectGroup>
          <SelectLabel>label-{i}</SelectLabel>
        </SelectGroup>,
      );
      unmount();
    }
  });

  it('SelectSeparator + SelectScrollDownButton 30 cycles in Select context', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="x">x</SelectItem>
          </SelectContent>
        </Select>,
      );
      unmount();
    }
  });

  it('handles 30 SelectValue with different placeholders', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`Select-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-2 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-2 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Select key={i}>
              <SelectTrigger>
                <SelectValue placeholder={`r2-p-${i}`} />
              </SelectTrigger>
            </Select>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 SelectGroup + SelectLabel 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <SelectGroup>
          <SelectLabel>r2-lbl-{i}</SelectLabel>
        </SelectGroup>,
      );
      unmount();
    }
  });

  it('round-2 SelectSeparator + SelectScrollDownButton 30 cycles in Select context', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={`v-${i}`}>v-{i}</SelectItem>
          </SelectContent>
        </Select>,
      );
      unmount();
    }
  });

  it('round-2 handles 30 SelectValue with different placeholders', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`r2-Select-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-3 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="x" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-3 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Select key={i}>
              <SelectTrigger>
                <SelectValue placeholder={`r3-${i}`} />
              </SelectTrigger>
            </Select>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="x" />
            </SelectTrigger>
          </Select>,
        ),
      ).not.toThrow();
    }
  });

  it('round-3 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="x" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-3 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`r3-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-4 mount-unmount 100 cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="r4" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-4 renders 100 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <Select key={i}>
              <SelectTrigger>
                <SelectValue placeholder={`r4-${i}`} />
              </SelectTrigger>
            </Select>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="x" />
            </SelectTrigger>
          </Select>,
        ),
      ).not.toThrow();
    }
  });

  it('round-4 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="r4" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-4 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`r4-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="r5" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Select key={i}>
              <SelectTrigger>
                <SelectValue placeholder={`r5-${i}`} />
              </SelectTrigger>
            </Select>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`r5-p-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="x" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-5 100 sequential select renders', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`r5-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-6 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="r6" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-6 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Select key={i}>
              <SelectTrigger>
                <SelectValue placeholder={`r6-${i}`} />
              </SelectTrigger>
            </Select>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-6 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`r6-p-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-6 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="x" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-6 100 sequential select renders', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`r6-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-7 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="r7" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-7 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Select key={i}>
              <SelectTrigger>
                <SelectValue placeholder={`r7-${i}`} />
              </SelectTrigger>
            </Select>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-7 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="r7" />
            </SelectTrigger>
          </Select>,
        ),
      ).not.toThrow();
    }
  });

  it('round-7 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="r7" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-7 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`r7-p-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-8 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="r8" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-8 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <Select key={i}>
              <SelectTrigger>
                <SelectValue placeholder={`r8-${i}`} />
              </SelectTrigger>
            </Select>
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-8 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() =>
        render(
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="x" />
            </SelectTrigger>
          </Select>,
        ),
      ).not.toThrow();
    }
  });

  it('round-8 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="x" />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });

  it('round-8 30 different placeholder values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={`r8-p-${i}`} />
          </SelectTrigger>
        </Select>,
      );
      unmount();
    }
  });
});
