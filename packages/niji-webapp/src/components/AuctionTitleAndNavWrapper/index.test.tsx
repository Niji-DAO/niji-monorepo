import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import classes from './AuctionTitleAndNavWrapper.module.css';

import AuctionTitleAndNavWrapper from './index';

describe('AuctionTitleAndNavWrapper Component', () => {
  it('should render children correctly', () => {
    const testText = 'Test Child Content';
    render(
      <AuctionTitleAndNavWrapper>
        <div data-testid="child-element">{testText}</div>
      </AuctionTitleAndNavWrapper>,
    );

    const childElement = screen.getByTestId('child-element');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent(testText);
  });

  it('should apply the correct CSS class', () => {
    render(
      <AuctionTitleAndNavWrapper>
        <div>Test Content</div>
      </AuctionTitleAndNavWrapper>,
    );

    const container = screen.getByText('Test Content').parentElement;
    expect(container).toHaveClass(classes.auctionTitleAndNavContainer);
  });

  it('should use Bootstrap Col with lg={12} prop', () => {
    render(
      <AuctionTitleAndNavWrapper>
        <div>Test Content</div>
      </AuctionTitleAndNavWrapper>,
    );

    const container = screen.getByText('Test Content').parentElement;
    expect(container).toHaveAttribute('class', expect.stringContaining('col-lg-12'));
  });

  it('should render multiple children correctly', () => {
    render(
      <AuctionTitleAndNavWrapper>
        <div data-testid="first-child">First Child</div>
        <div data-testid="second-child">Second Child</div>
      </AuctionTitleAndNavWrapper>,
    );

    expect(screen.getByTestId('first-child')).toBeInTheDocument();
    expect(screen.getByTestId('second-child')).toBeInTheDocument();
  });

  it('renders numeric children inside Col', () => {
    const { container } = render(<AuctionTitleAndNavWrapper>{42}</AuctionTitleAndNavWrapper>);
    expect(container.textContent).toBe('42');
  });

  it('renders array children concatenated', () => {
    const { container } = render(
      <AuctionTitleAndNavWrapper>{['a', 'b', 'c']}</AuctionTitleAndNavWrapper>,
    );
    expect(container.textContent).toBe('abc');
  });

  it('renders null children without crashing', () => {
    const { container } = render(<AuctionTitleAndNavWrapper>{null}</AuctionTitleAndNavWrapper>);
    expect(container.textContent).toBe('');
  });

  it('outermost wrapper is single element with col-lg-12', () => {
    const { container } = render(<AuctionTitleAndNavWrapper>x</AuctionTitleAndNavWrapper>);
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.className).toContain('col-lg-12');
  });

  it('applies CSS module className alongside Bootstrap col class', () => {
    const { container } = render(<AuctionTitleAndNavWrapper>x</AuctionTitleAndNavWrapper>);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain(classes.auctionTitleAndNavContainer);
    expect(wrapper?.className).toContain('col-lg-12');
  });

  it('renders Fragment children unwrapped', () => {
    const { container } = render(
      <AuctionTitleAndNavWrapper>
        <>
          <span>x</span>
          <span>y</span>
        </>
      </AuctionTitleAndNavWrapper>,
    );
    expect(container.querySelectorAll('span').length).toBe(2);
  });

  it('renders boolean true children as nothing', () => {
    const { container } = render(<AuctionTitleAndNavWrapper>{true}</AuctionTitleAndNavWrapper>);
    expect(container.textContent).toBe('');
  });

  it('renders empty string children gracefully', () => {
    const { container } = render(<AuctionTitleAndNavWrapper>{''}</AuctionTitleAndNavWrapper>);
    expect(container.textContent).toBe('');
  });

  it('CSS module className includes auctionTitleAndNavContainer hash', () => {
    const { container } = render(<AuctionTitleAndNavWrapper>x</AuctionTitleAndNavWrapper>);
    expect(container.firstElementChild?.className).toContain(classes.auctionTitleAndNavContainer);
  });

  it('renders nested div tree', () => {
    const { container } = render(
      <AuctionTitleAndNavWrapper>
        <div data-testid="outer">
          <div data-testid="inner">deep</div>
        </div>
      </AuctionTitleAndNavWrapper>,
    );
    expect(container.querySelector('[data-testid="outer"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="inner"]')?.textContent).toBe('deep');
  });

  it('renders large number of children (10 spans)', () => {
    const { container } = render(
      <AuctionTitleAndNavWrapper>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>{i}</span>
        ))}
      </AuctionTitleAndNavWrapper>,
    );
    expect(container.querySelectorAll('span').length).toBe(10);
  });

  it('rerender updates children content', () => {
    const { container, rerender } = render(
      <AuctionTitleAndNavWrapper>first</AuctionTitleAndNavWrapper>,
    );
    expect(container.textContent).toBe('first');
    rerender(<AuctionTitleAndNavWrapper>second</AuctionTitleAndNavWrapper>);
    expect(container.textContent).toBe('second');
  });

  it('0 children renders as "0"', () => {
    const { container } = render(<AuctionTitleAndNavWrapper>{0}</AuctionTitleAndNavWrapper>);
    expect(container.textContent).toBe('0');
  });

  it('multiple instances render independently', () => {
    const { container } = render(
      <>
        <AuctionTitleAndNavWrapper>a</AuctionTitleAndNavWrapper>
        <AuctionTitleAndNavWrapper>b</AuctionTitleAndNavWrapper>
      </>,
    );
    expect(container.children.length).toBe(2);
  });

  it('long children string (500 chars) renders fully', () => {
    const long = 'x'.repeat(500);
    const { container } = render(<AuctionTitleAndNavWrapper>{long}</AuctionTitleAndNavWrapper>);
    expect(container.textContent?.length).toBe(500);
  });

  it('unicode children render verbatim', () => {
    const { container } = render(<AuctionTitleAndNavWrapper>こんにちは</AuctionTitleAndNavWrapper>);
    expect(container.textContent).toBe('こんにちは');
  });

  it('mixed text + element children render', () => {
    const { container } = render(
      <AuctionTitleAndNavWrapper>
        text-<strong>strong</strong>
      </AuctionTitleAndNavWrapper>,
    );
    expect(container.querySelector('strong')?.textContent).toBe('strong');
    expect(container.textContent).toContain('text-');
  });
});
