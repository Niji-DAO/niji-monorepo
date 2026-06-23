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
});
