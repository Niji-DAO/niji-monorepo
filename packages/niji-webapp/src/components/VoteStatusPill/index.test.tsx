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
});
