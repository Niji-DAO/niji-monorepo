import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock('remark-breaks', () => ({
  default: () => null,
}));

import ProposalEditor from './index';

const defaults = {
  title: '',
  body: '',
  onTitleInput: () => {},
  onBodyInput: () => {},
};

describe('ProposalEditor', () => {
  it('renders "Proposal" header label by default', () => {
    const { container } = render(<ProposalEditor {...defaults} />);
    expect(container.textContent).toContain('Proposal');
  });

  it('renders "Candidate" label when isCandidate=true', () => {
    const { container } = render(<ProposalEditor {...defaults} isCandidate={true} />);
    expect(container.textContent).toContain('Candidate');
  });

  it('renders title input + body textarea', () => {
    const { container } = render(<ProposalEditor {...defaults} />);
    expect(container.querySelector('input')).not.toBeNull();
    expect(container.querySelector('textarea')).not.toBeNull();
  });

  it('uses different placeholder when isCandidate=true', () => {
    const { container } = render(<ProposalEditor {...defaults} isCandidate={true} />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe(
      'Proposal candidate title',
    );
  });

  it('uses regular placeholder when isCandidate=false', () => {
    const { container } = render(<ProposalEditor {...defaults} />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe('Proposal title');
  });

  it('fires onTitleInput on title change', () => {
    const onTitle = vi.fn();
    const { container } = render(<ProposalEditor {...defaults} onTitleInput={onTitle} />);
    const input = container.querySelector('input');
    if (input) fireEvent.change(input, { target: { value: 'New Title' } });
    expect(onTitle).toHaveBeenCalledWith('New Title');
  });

  it('fires onBodyInput on body change', () => {
    const onBody = vi.fn();
    const { container } = render(<ProposalEditor {...defaults} onBodyInput={onBody} />);
    const ta = container.querySelector('textarea');
    if (ta) fireEvent.change(ta, { target: { value: 'Body text' } });
    expect(onBody).toHaveBeenCalledWith('Body text');
  });

  it('hides preview when body is empty', () => {
    const { container } = render(<ProposalEditor {...defaults} />);
    expect(container.querySelector('[data-testid="markdown"]')).toBeNull();
  });

  it('shows preview + markdown when body is non-empty', () => {
    const { container } = render(<ProposalEditor {...defaults} body="# Hello" />);
    expect(container.textContent).toContain('Preview');
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe('# Hello');
  });

  it('shows title preview h1 when both title + body present', () => {
    const { container } = render(<ProposalEditor {...defaults} title="My Title" body="# Hello" />);
    expect(container.querySelector('h1')?.textContent).toBe('My Title');
  });

  it('does NOT show title preview h1 when only body present', () => {
    const { container } = render(<ProposalEditor {...defaults} title="" body="# Hello" />);
    expect(container.querySelector('h1')).toBeNull();
  });

  it('preserves multi-line body in textarea + markdown preview', () => {
    const body = 'line1\nline2\nline3';
    const { container } = render(<ProposalEditor {...defaults} body={body} />);
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe(body);
  });

  it('renders title verbatim in input value', () => {
    const { container } = render(<ProposalEditor {...defaults} title="My Proposal Title" />);
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('My Proposal Title');
  });

  it('renders body verbatim in textarea value', () => {
    const { container } = render(<ProposalEditor {...defaults} body="body content" />);
    expect((container.querySelector('textarea') as HTMLTextAreaElement).value).toBe('body content');
  });

  it('renders unicode body content', () => {
    const { container } = render(<ProposalEditor {...defaults} body="日本語本文" />);
    expect(container.querySelector('[data-testid="markdown"]')?.textContent).toBe('日本語本文');
  });

  it('repeated title change fires onTitleInput multiple times', () => {
    const onTitle = vi.fn();
    const { container } = render(<ProposalEditor {...defaults} onTitleInput={onTitle} />);
    const input = container.querySelector('input');
    if (input) {
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });
    }
    expect(onTitle).toHaveBeenCalledTimes(3);
  });

  it('rerender from empty body to non-empty shows preview', () => {
    const { container, rerender } = render(<ProposalEditor {...defaults} />);
    expect(container.querySelector('[data-testid="markdown"]')).toBeNull();
    rerender(<ProposalEditor {...defaults} body="# Hello" />);
    expect(container.querySelector('[data-testid="markdown"]')).not.toBeNull();
  });

  it('renders exactly 1 input element', () => {
    const { container } = render(<ProposalEditor {...defaults} />);
    expect(container.querySelectorAll('input').length).toBe(1);
  });

  it('renders exactly 1 textarea element', () => {
    const { container } = render(<ProposalEditor {...defaults} />);
    expect(container.querySelectorAll('textarea').length).toBe(1);
  });

  it('repeated body change fires onBodyInput N times', () => {
    const onBody = vi.fn();
    const { container } = render(<ProposalEditor {...defaults} onBodyInput={onBody} />);
    const ta = container.querySelector('textarea');
    if (ta) {
      fireEvent.change(ta, { target: { value: 'a' } });
      fireEvent.change(ta, { target: { value: 'ab' } });
    }
    expect(onBody).toHaveBeenCalledTimes(2);
  });

  it('rerender title updates input value', () => {
    const { container, rerender } = render(<ProposalEditor {...defaults} title="A" />);
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('A');
    rerender(<ProposalEditor {...defaults} title="B" />);
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('B');
  });

  it('long body content (500 chars) renders in textarea + markdown', () => {
    const long = 'a'.repeat(500);
    const { container } = render(<ProposalEditor {...defaults} body={long} />);
    expect((container.querySelector('textarea') as HTMLTextAreaElement).value.length).toBe(500);
    expect(container.querySelector('[data-testid="markdown"]')?.textContent?.length).toBe(500);
  });

  it('isCandidate=true placeholder is "Proposal candidate title"', () => {
    const { container } = render(<ProposalEditor {...defaults} isCandidate={true} />);
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe(
      'Proposal candidate title',
    );
  });
});
