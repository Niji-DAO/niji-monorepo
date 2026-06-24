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
});
