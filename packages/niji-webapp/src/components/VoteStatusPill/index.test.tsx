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
});
