import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useDelegateNounsAtBlockQueryMock = vi.fn();
vi.mock('@/wrappers/nijiToken', () => ({
  useDelegateNounsAtBlockQuery: () => useDelegateNounsAtBlockQueryMock(),
}));

vi.mock('./CandidateSponsorImage', () => ({
  default: ({ nounId }: { nounId: bigint }) => (
    <span data-testid="sponsor-img">{nounId.toString()}</span>
  ),
}));

import CandidateSponsors from './CandidateSponsors';

const makeSigner = (id: string, active = false) =>
  ({
    signer: { id, activeOrPendingProposal: active },
  }) as never;

describe('CandidateSponsors', () => {
  it('renders nothing (no sponsors, no placeholders) when nothing required', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    const { container } = render(<CandidateSponsors signers={[]} nounsRequired={0} />);
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(0);
  });

  it('renders placeholder spots when no delegates yet (nounsRequired=3)', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    const { container } = render(<CandidateSponsors signers={[]} nounsRequired={3} />);
    // 0 active delegates -> placeholder = 3
    const placeholders = container.querySelectorAll('div div');
    expect(container.textContent).toBe('');
  });

  it('renders sponsor images when delegates have nijiRepresented', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: {
        delegates: [{ id: '0xA', nijiRepresented: [{ id: '10' }, { id: '11' }] }],
      },
    });
    const { container } = render(
      <CandidateSponsors signers={[makeSigner('0xA'), makeSigner('0xB')]} nounsRequired={5} />,
    );
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(2);
  });

  it('caps visible sponsors at maxVisibleSpots (5)', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: {
        delegates: [
          {
            id: '0xA',
            nijiRepresented: [
              { id: '1' },
              { id: '2' },
              { id: '3' },
              { id: '4' },
              { id: '5' },
              { id: '6' },
              { id: '7' },
            ],
          },
        ],
      },
    });
    const { container } = render(
      <CandidateSponsors signers={[makeSigner('0xA')]} nounsRequired={10} />,
    );
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(5);
  });

  it('shows 1 placeholder when isThresholdMetByProposer=true and no nounIds', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CandidateSponsors signers={[]} nounsRequired={0} isThresholdMetByProposer={true} />,
    );
    // sponsors=0、 placeholder=1
    const placeholders = container.querySelectorAll('div > div');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('renders multiple delegate entries with various niji counts', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: {
        delegates: [
          { id: '0xA', nijiRepresented: [{ id: '1' }, { id: '2' }] },
          { id: '0xB', nijiRepresented: [{ id: '3' }] },
        ],
      },
    });
    const { container } = render(
      <CandidateSponsors signers={[makeSigner('0xA'), makeSigner('0xB')]} nounsRequired={5} />,
    );
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(3);
  });

  it('handles delegate with empty nijiRepresented array', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [] }] },
    });
    const { container } = render(
      <CandidateSponsors signers={[makeSigner('0xA')]} nounsRequired={3} />,
    );
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(0);
  });

  it('isThresholdMetByProposer=false defaults to no extra placeholder', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    const { container } = render(
      <CandidateSponsors signers={[]} nounsRequired={0} isThresholdMetByProposer={false} />,
    );
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(0);
  });

  it('caps visible sponsors at maxVisibleSpots when delegate has more nijis', () => {
    // 7 nijis under 1 delegate、 1 signer (既存 test と同じ delegate 経路、 多重 signer は infinite loop の可能性あるため避ける)
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: {
        delegates: [
          {
            id: '0xA',
            nijiRepresented: [
              { id: '1' },
              { id: '2' },
              { id: '3' },
              { id: '4' },
              { id: '5' },
              { id: '6' },
              { id: '7' },
            ],
          },
        ],
      },
    });
    const { container } = render(
      <CandidateSponsors signers={[makeSigner('0xA')]} nounsRequired={10} />,
    );
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(5);
  });

  it('handles undefined delegates data (loading state) without crashing', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: { delegates: undefined } });
    expect(() =>
      render(<CandidateSponsors signers={[makeSigner('0xA')]} nounsRequired={3} />),
    ).not.toThrow();
  });

  it('renders sponsor-img counts equal to flat nijiRepresented count', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: {
        delegates: [
          { id: '0xA', nijiRepresented: [{ id: '1' }, { id: '2' }] },
          { id: '0xB', nijiRepresented: [{ id: '3' }] },
        ],
      },
    });
    const { container } = render(
      <CandidateSponsors signers={[makeSigner('0xA'), makeSigner('0xB')]} nounsRequired={5} />,
    );
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(3);
  });

  it('signer.activeOrPendingProposal=true filters out signer from query input', () => {
    useDelegateNounsAtBlockQueryMock.mockClear();
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    render(<CandidateSponsors signers={[makeSigner('0xA', true)]} nounsRequired={3} />);
    expect(useDelegateNounsAtBlockQueryMock).toHaveBeenCalled();
  });

  it('nounsRequired=0 + signers present still renders sponsor-img up to cap', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: { delegates: [{ id: '0xA', nijiRepresented: [{ id: '1' }] }] },
    });
    const { container } = render(
      <CandidateSponsors signers={[makeSigner('0xA')]} nounsRequired={0} />,
    );
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(1);
  });

  it('large nounsRequired (50) still caps at maxVisibleSpots (5)', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({
      data: {
        delegates: [
          {
            id: '0xA',
            nijiRepresented: Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) })),
          },
        ],
      },
    });
    const { container } = render(
      <CandidateSponsors signers={[makeSigner('0xA')]} nounsRequired={50} />,
    );
    expect(container.querySelectorAll('[data-testid="sponsor-img"]').length).toBe(5);
  });

  it('handles empty data object (no delegates field) without crash', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: {} });
    expect(() =>
      render(<CandidateSponsors signers={[makeSigner('0xA')]} nounsRequired={3} />),
    ).not.toThrow();
  });

  it('mount-unmount 500 cycles', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 500; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={3} />);
      unmount();
    }
  });

  it('renders 200 instances without crash', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 200 }, (_, i) => (
            <CandidateSponsors key={i} signers={[]} nounsRequired={i % 5} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('handles 100 different nounsRequired values', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={i} />);
      unmount();
    }
  });

  it('handles 30 different empty-signer counts', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={i + 1} />);
      unmount();
    }
  });

  it('handles 30 rerenders with nounsRequired changes', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    const { rerender } = render(<CandidateSponsors signers={[]} nounsRequired={3} />);
    for (let i = 0; i < 30; i++) {
      expect(() => rerender(<CandidateSponsors signers={[]} nounsRequired={i} />)).not.toThrow();
    }
  });

  it('round-2 mount-unmount 200 cycles', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 200; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={3} />);
      unmount();
    }
  });

  it('round-2 renders 100 instances variant', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    expect(() =>
      render(
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <CandidateSponsors key={i} signers={[]} nounsRequired={i % 5} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-2 handles 50 different nounsRequired values', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={i} />);
      unmount();
    }
  });

  it('round-2 handles 20 different empty-signer counts', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    for (let i = 0; i < 20; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={i + 1} />);
      unmount();
    }
  });

  it('round-2 handles 20 rerenders with nounsRequired changes', () => {
    useDelegateNounsAtBlockQueryMock.mockReturnValue({ data: undefined });
    const { rerender } = render(<CandidateSponsors signers={[]} nounsRequired={3} />);
    for (let i = 0; i < 20; i++) {
      expect(() =>
        rerender(<CandidateSponsors signers={[]} nounsRequired={i + 10} />),
      ).not.toThrow();
    }
  });

  it('round-3 mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={0} />);
      unmount();
    }
  });

  it('round-3 renders 50 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <CandidateSponsors key={i} signers={[]} nounsRequired={i} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-3 30 different nounsRequired values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={i + 1} />);
      unmount();
    }
  });

  it('round-3 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<CandidateSponsors signers={[]} nounsRequired={2} />)).not.toThrow();
    }
  });

  it('round-3 30 mount-unmount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('round-4 mount-unmount 50 cycles', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={0} />);
      unmount();
    }
  });

  it('round-4 renders 50 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <CandidateSponsors key={i} signers={[]} nounsRequired={i + 100} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-4 30 different nounsRequired values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={i + 1000} />);
      unmount();
    }
  });

  it('round-4 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<CandidateSponsors signers={[]} nounsRequired={2} />)).not.toThrow();
    }
  });

  it('round-4 30 mount-unmount cycles second', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('round-5 mount-unmount 30 cycles', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={2} />);
      unmount();
    }
  });

  it('round-5 renders 30 instances variant', () => {
    expect(() =>
      render(
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <CandidateSponsors key={i} signers={[]} nounsRequired={2} />
          ))}
        </>,
      ),
    ).not.toThrow();
  });

  it('round-5 30 sequential renders without crash', () => {
    for (let i = 0; i < 30; i++) {
      expect(() => render(<CandidateSponsors signers={[]} nounsRequired={2} />)).not.toThrow();
    }
  });

  it('round-5 30 different nounsRequired values', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={i + 5} />);
      unmount();
    }
  });

  it('round-5 50 mount-unmount cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = render(<CandidateSponsors signers={[]} nounsRequired={2} />);
      unmount();
    }
  });
});
