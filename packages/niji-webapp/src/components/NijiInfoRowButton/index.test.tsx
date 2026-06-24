import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useAtomValueMock = vi.fn();
vi.mock('jotai/react', () => ({
  useAtomValue: () => useAtomValueMock(),
}));

import NijiInfoRowButton from './index';

describe('NijiInfoRowButton', () => {
  it('renders button text', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="Vote" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('Vote');
  });

  it('renders the icon image', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/icon.png" btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/icon.png');
  });

  it('uses cool class when isCool=true', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toMatch(/cool/i);
  });

  it('uses warm class when isCool=false', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    const cls = container.querySelector('div')?.className ?? '';
    expect(cls).toMatch(/warm/i);
  });

  it('fires onClickHandler when clicked', () => {
    useAtomValueMock.mockReturnValue(true);
    const onClick = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={onClick} />,
    );
    const div = container.querySelector('div');
    if (div) fireEvent.click(div);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClickHandler on repeated clicks', () => {
    useAtomValueMock.mockReturnValue(true);
    const onClick = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={onClick} />,
    );
    const div = container.querySelector('div');
    if (div) {
      fireEvent.click(div);
      fireEvent.click(div);
      fireEvent.click(div);
    }
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('renders long btnText (200 chars)', () => {
    useAtomValueMock.mockReturnValue(true);
    const long = 'a'.repeat(200);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText={long} onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe(long);
  });

  it('renders exactly 1 img element', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelectorAll('img').length).toBe(1);
  });

  it('accepts data URI as iconImgSource', () => {
    useAtomValueMock.mockReturnValue(true);
    const dataUri = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=';
    const { container } = render(
      <NijiInfoRowButton iconImgSource={dataUri} btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe(dataUri);
  });

  it('outermost wrapper is a single <div>', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('renders empty btnText', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('div')?.textContent).toBe('');
  });

  it('JSX btnText (ReactNode) renders as JSX child', () => {
    useAtomValueMock.mockReturnValue(true);
    const { container } = render(
      <NijiInfoRowButton
        iconImgSource="/x.png"
        btnText={<strong data-testid="jsx-text">Bold</strong>}
        onClickHandler={() => {}}
      />,
    );
    expect(container.querySelector('[data-testid="jsx-text"]')?.textContent).toBe('Bold');
  });

  it('multiple clicks call handler N times', () => {
    useAtomValueMock.mockReturnValue(true);
    const onClick = vi.fn();
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="x" onClickHandler={onClick} />,
    );
    const div = container.querySelector('div');
    if (div) {
      for (let i = 0; i < 5; i++) fireEvent.click(div);
    }
    expect(onClick).toHaveBeenCalledTimes(5);
  });

  it('isCool toggle does not affect button text', () => {
    useAtomValueMock.mockReturnValue(false);
    const { container } = render(
      <NijiInfoRowButton iconImgSource="/x.png" btnText="My text" onClickHandler={() => {}} />,
    );
    expect(container.textContent).toBe('My text');
  });

  it('large size icon URL still renders correctly', () => {
    useAtomValueMock.mockReturnValue(true);
    const long = 'https://example.com/' + 'a'.repeat(500) + '.png';
    const { container } = render(
      <NijiInfoRowButton iconImgSource={long} btnText="x" onClickHandler={() => {}} />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe(long);
  });
});
