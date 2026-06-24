import React from 'react';

import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

beforeAll(() => {
  if (!global.ResizeObserver) {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

describe('Tooltip', () => {
  it('does not render TooltipContent text when tooltip is closed', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>hover me</TooltipTrigger>
          <TooltipContent>
            <span data-testid="tooltip-body">help text</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(document.querySelector('[data-testid="tooltip-body"]')).toBeNull();
  });

  it('renders TooltipContent via open prop', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>hover me</TooltipTrigger>
          <TooltipContent>
            <span data-testid="tooltip-body">help text</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(document.querySelector('[data-testid="tooltip-body"]')?.textContent).toBe('help text');
  });

  it('TooltipContent merges custom className', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>x</TooltipTrigger>
          <TooltipContent data-testid="content" className="custom-tooltip-class">
            tip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const content = document.querySelector('[data-testid="content"]');
    expect(content?.className).toContain('custom-tooltip-class');
    expect(content?.className).toContain('text-xs');
  });

  it('TooltipContent contains arrow element by default', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>x</TooltipTrigger>
          <TooltipContent data-testid="content">tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const content = document.querySelector('[data-testid="content"]');
    expect(content?.querySelector('svg')).not.toBeNull();
  });

  it('TooltipTrigger renders children text', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="trigger">hover me</TooltipTrigger>
          <TooltipContent>tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const trigger = container.querySelector('[data-testid="trigger"]');
    expect(trigger?.textContent).toBe('hover me');
  });

  it('handles two tooltips independently (one open, one closed)', () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>t1</TooltipTrigger>
          <TooltipContent>
            <span data-testid="tip-a">tip a</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip open={false}>
          <TooltipTrigger>t2</TooltipTrigger>
          <TooltipContent>
            <span data-testid="tip-b">tip b</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(document.querySelector('[data-testid="tip-a"]')?.textContent).toBe('tip a');
    expect(document.querySelector('[data-testid="tip-b"]')).toBeNull();
  });

  it('TooltipContent default sideOffset is 4 (passes prop without crash)', () => {
    expect(() =>
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent>tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });

  it('TooltipContent accepts custom sideOffset prop', () => {
    expect(() =>
      render(
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger>x</TooltipTrigger>
            <TooltipContent sideOffset={10}>tip</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      ),
    ).not.toThrow();
  });
});
