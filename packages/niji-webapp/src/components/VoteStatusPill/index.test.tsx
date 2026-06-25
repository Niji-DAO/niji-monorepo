import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import VoteStatusPill from './index';

describe('VoteStatusPill', () => {
  it('renders text content inside a div', () => {
    const { container } = render(<VoteStatusPill status="success" text="PASS" />);
    expect(container.querySelector('div')?.textContent).toBe('PASS');
  });

  it('uses success class for status="success"', () => {
    const { container } = render(<VoteStatusPill status="success" text="ok" />);
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toMatch(/pass/i);
  });

  it('uses failure class for status="failure"', () => {
    const { container } = render(<VoteStatusPill status="failure" text="x" />);
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toMatch(/fail/i);
  });

  it('uses pending class for unknown status (default branch)', () => {
    const { container } = render(<VoteStatusPill status="unknown-state" text="..." />);
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toMatch(/pending/i);
  });

  it('renders ReactNode text (nested span)', () => {
    const { container } = render(<VoteStatusPill status="success" text={<span>nested</span>} />);
    expect(container.querySelector('span')?.textContent).toBe('nested');
  });

  it('renders empty text without crashing', () => {
    const { container } = render(<VoteStatusPill status="success" text="" />);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders numeric text (auto stringified)', () => {
    const { container } = render(<VoteStatusPill status="success" text={42 as never} />);
    expect(container.querySelector('div')?.textContent).toBe('42');
  });

  it('renders Fragment text containing multiple nodes', () => {
    const { container } = render(
      <VoteStatusPill
        status="success"
        text={
          <>
            <span>a</span>
            <span>b</span>
          </>
        }
      />,
    );
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('empty status falls to pending (default branch)', () => {
    const { container } = render(<VoteStatusPill status="" text="x" />);
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toMatch(/pending/i);
  });

  it('outermost wrapper is a single <div>', () => {
    const { container } = render(<VoteStatusPill status="success" text="x" />);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('different statuses produce different class names', () => {
    const { container: c1 } = render(<VoteStatusPill status="success" text="x" />);
    const { container: c2 } = render(<VoteStatusPill status="failure" text="x" />);
    expect(c1.querySelector('div')?.className).not.toBe(c2.querySelector('div')?.className);
  });

  it('long text (500 chars) renders verbatim', () => {
    const long = 'a'.repeat(500);
    const { container } = render(<VoteStatusPill status="success" text={long} />);
    expect(container.querySelector('div')?.textContent?.length).toBe(500);
  });

  it('unicode text renders correctly', () => {
    const { container } = render(<VoteStatusPill status="success" text="日本語テキスト" />);
    expect(container.querySelector('div')?.textContent).toBe('日本語テキスト');
  });

  it('rerender with new status changes class', () => {
    const { container, rerender } = render(<VoteStatusPill status="success" text="x" />);
    const successCls = container.querySelector('div')?.className;
    rerender(<VoteStatusPill status="failure" text="x" />);
    expect(container.querySelector('div')?.className).not.toBe(successCls);
  });

  it('multiple instances render independently with different statuses', () => {
    const { container } = render(
      <>
        <VoteStatusPill status="success" text="A" />
        <VoteStatusPill status="failure" text="B" />
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(2);
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
  });

  it('rerender from failure to success switches class', () => {
    const { container, rerender } = render(<VoteStatusPill status="failure" text="x" />);
    expect(container.querySelector('div')?.className).toMatch(/fail/i);
    rerender(<VoteStatusPill status="success" text="x" />);
    expect(container.querySelector('div')?.className).toMatch(/pass/i);
  });

  it('rerender text updates content', () => {
    const { container, rerender } = render(<VoteStatusPill status="success" text="First" />);
    expect(container.textContent).toBe('First');
    rerender(<VoteStatusPill status="success" text="Second" />);
    expect(container.textContent).toBe('Second');
  });

  it('div className is non-empty string', () => {
    const { container } = render(<VoteStatusPill status="success" text="x" />);
    expect(container.querySelector('div')?.className).toBeTruthy();
  });

  it('renders exactly 1 div per pill', () => {
    const { container } = render(<VoteStatusPill status="success" text="x" />);
    expect(container.querySelectorAll('div').length).toBe(1);
  });

  it('boolean false text renders as empty', () => {
    const { container } = render(<VoteStatusPill status="success" text={false as never} />);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('5 instances render 5 distinct divs', () => {
    const { container } = render(
      <>
        <VoteStatusPill status="success" text="1" />
        <VoteStatusPill status="failure" text="2" />
        <VoteStatusPill status="success" text="3" />
        <VoteStatusPill status="failure" text="4" />
        <VoteStatusPill status="success" text="5" />
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(5);
  });

  it('null text renders as empty', () => {
    const { container } = render(<VoteStatusPill status="success" text={null} />);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('emoji text renders verbatim', () => {
    const { container } = render(<VoteStatusPill status="success" text="🎉" />);
    expect(container.querySelector('div')?.textContent).toBe('🎉');
  });

  it('multi-class status with hyphen still falls to pending (default)', () => {
    const { container } = render(<VoteStatusPill status="some-other" text="x" />);
    expect(container.querySelector('div')?.className).toMatch(/pending/i);
  });

  it('text + element children inside text prop renders', () => {
    const { container } = render(
      <VoteStatusPill
        status="success"
        text={
          <>
            a<strong>b</strong>c
          </>
        }
      />,
    );
    expect(container.querySelector('strong')?.textContent).toBe('b');
  });

  it('rerender from text to JSX updates content', () => {
    const { container, rerender } = render(<VoteStatusPill status="success" text="first" />);
    expect(container.textContent).toBe('first');
    rerender(<VoteStatusPill status="success" text={<span>second</span>} />);
    expect(container.querySelector('span')?.textContent).toBe('second');
  });

  it('div tagName is DIV (semantic)', () => {
    const { container } = render(<VoteStatusPill status="success" text="x" />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders 5 instances each with own status', () => {
    const { container } = render(
      <>
        <VoteStatusPill status="success" text="A" />
        <VoteStatusPill status="failure" text="B" />
        <VoteStatusPill status="pending" text="C" />
        <VoteStatusPill status="success" text="D" />
        <VoteStatusPill status="failure" text="E" />
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(5);
  });

  it('rerender text updates display', () => {
    const { container, rerender } = render(<VoteStatusPill status="success" text="first" />);
    expect(container.querySelector('div')?.textContent).toBe('first');
    rerender(<VoteStatusPill status="success" text="second" />);
    expect(container.querySelector('div')?.textContent).toBe('second');
  });

  it('rerender status changes className', () => {
    const { container, rerender } = render(<VoteStatusPill status="success" text="x" />);
    const initial = container.querySelector('div')?.className;
    rerender(<VoteStatusPill status="failure" text="x" />);
    expect(container.querySelector('div')?.className).not.toBe(initial);
  });

  it('renders empty string text', () => {
    const { container } = render(<VoteStatusPill status="success" text="" />);
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('renders unicode text', () => {
    const { container } = render(<VoteStatusPill status="success" text="日本語ステータス" />);
    expect(container.querySelector('div')?.textContent).toBe('日本語ステータス');
  });

  it('mount-unmount 1000 cycles', () => {
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<VoteStatusPill status="success" text="x" />);
      unmount();
    }
  });

  it('renders 2000 instances without crash', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 2000 }, (_, i) => (
            <VoteStatusPill key={i} status="success" text={`x-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 200 different text values', () => {
    for (let i = 0; i < 200; i++) {
      const { container, unmount } = render(<VoteStatusPill status="success" text={`text-${i}`} />);
      expect(container.querySelector('div')?.textContent).toBe(`text-${i}`);
      unmount();
    }
  });

  it('all 500 instances render div root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 500 }, (_, i) => (
          <VoteStatusPill key={i} status="success" text={`x-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(500);
  });

  it('rapid 200 status transitions rerender', () => {
    const statuses = ['success', 'failure', 'pending', 'unknown'];
    const { rerender } = render(<VoteStatusPill status="success" text="x" />);
    for (let i = 0; i < 200; i++) {
      expect(() =>
        rerender(<VoteStatusPill status={statuses[i % 4]} text={`x-${i}`} />),
      ).not.toThrow();
    }
  });

  it('round-2 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<VoteStatusPill status="success" text="x" />);
      unmount();
    }
  });

  it('round-2 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <VoteStatusPill key={i} status="success" text={`r2-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 100 different text values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <VoteStatusPill status="success" text={`r2-text-${i}`} />,
      );
      expect(container.querySelector('div')?.textContent).toBe(`r2-text-${i}`);
      unmount();
    }
  });

  it('round-2 all 200 instances render div root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <VoteStatusPill key={i} status="success" text={`x-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(200);
  });

  it('round-2 rapid 100 status transitions', () => {
    const statuses = ['success', 'failure', 'pending', 'unknown'];
    const { rerender } = render(<VoteStatusPill status="success" text="x" />);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<VoteStatusPill status={statuses[i % 4]} text={`r2-${i}`} />),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 500 cycles', () => {
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<VoteStatusPill status="success" text="x" />);
      unmount();
    }
  });

  it('round-3 renders 1000 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 1000 }, (_, i) => (
            <VoteStatusPill key={i} status="success" text={`r3-${i}`} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 100 different text values', () => {
    for (let i = 0; i < 100; i++) {
      const { container, unmount } = render(
        <VoteStatusPill status="success" text={`r3-text-${i}`} />,
      );
      expect(container.querySelector('div')?.textContent).toBe(`r3-text-${i}`);
      unmount();
    }
  });

  it('round-3 all 200 instances render div root', () => {
    const { container } = render(
      <>
        {Array.from({ length: 200 }, (_, i) => (
          <VoteStatusPill key={i} status="success" text={`x-${i}`} />
        ))}
      </>,
    );
    expect(container.querySelectorAll('div').length).toBe(200);
  });

  it('round-3 100 status transitions', () => {
    const statuses = ['success', 'failure', 'pending', 'unknown'];
    const { rerender } = render(<VoteStatusPill status="success" text="x" />);
    for (let i = 0; i < 100; i++) {
      expect(() =>
        rerender(<VoteStatusPill status={statuses[i % 4]} text={`r3-${i}`} />),
      ).not.toThrow();
    }
  });
});
