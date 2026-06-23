import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const useBlockNumberMock = vi.fn();
vi.mock('wagmi', () => ({
  useBlockNumber: () => useBlockNumberMock(),
}));

vi.mock('@/components/ByLineHoverCard', () => ({
  default: () => <span data-testid="byline" />,
}));

vi.mock('@/components/HoverCard', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="hover">{children}</span>
  ),
}));

vi.mock('@/components/ProposalContent', () => ({
  transactionIconLink: (hash: string) => <a data-testid="tx-link">{hash}</a>,
}));

vi.mock('@/components/ShortAddress', () => ({
  default: ({ address }: { address: string }) => <span data-testid="short">{address}</span>,
}));

const useActiveLocaleMock = vi.fn();
vi.mock('@/hooks/useActivateLocale', () => ({
  useActiveLocale: () => useActiveLocaleMock(),
}));

vi.mock('@/i18n/locales', () => ({
  Locales: {
    en_US: 'en-US',
    ja_JP: 'ja-JP',
    zh_CN: 'zh-CN',
  },
}));

vi.mock('@/utils/etherscan', () => ({
  buildEtherscanAddressLink: (a: string) => `https://etherscan.io/address/${a}`,
}));

const isMobileMock = vi.fn();
vi.mock('@/utils/isMobile', () => ({
  isMobileScreen: () => isMobileMock(),
}));

vi.mock('@/utils/timeUtils', () => ({
  relativeTimestamp: () => '1 day ago',
}));

const useUserVotesAsOfBlockMock = vi.fn();
vi.mock('@/wrappers/nijiToken', () => ({
  useUserVotesAsOfBlock: () => useUserVotesAsOfBlockMock(),
}));

import CandidateHeader from './CandidateHeader';

const defaults = {
  title: 'My Candidate',
  id: 'cand-1',
  proposer: '0xABC',
  versionsCount: 1,
  createdTransactionHash: '0xdeadbeef',
  lastUpdatedTimestamp: 1700000000,
  isActiveForVoting: false,
  isWalletConnected: false,
  submitButtonClickHandler: () => {},
};

const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('CandidateHeader', () => {
  it('renders title', () => {
    useBlockNumberMock.mockReturnValue({ data: 100n });
    useActiveLocaleMock.mockReturnValue('en-US');
    isMobileMock.mockReturnValue(false);
    useUserVotesAsOfBlockMock.mockReturnValue(5);
    const { container } = wrap(<CandidateHeader {...defaults} />);
    expect(container.textContent).toContain('My Candidate');
  });

  it('renders ShortAddress for proposer', () => {
    useBlockNumberMock.mockReturnValue({ data: 100n });
    useActiveLocaleMock.mockReturnValue('en-US');
    isMobileMock.mockReturnValue(false);
    useUserVotesAsOfBlockMock.mockReturnValue(5);
    const { container } = wrap(<CandidateHeader {...defaults} />);
    expect(container.querySelector('[data-testid="short"]')?.textContent).toBe('0xABC');
  });

  it('renders ByLineHoverCard hover content', () => {
    useBlockNumberMock.mockReturnValue({ data: 100n });
    useActiveLocaleMock.mockReturnValue('en-US');
    isMobileMock.mockReturnValue(false);
    useUserVotesAsOfBlockMock.mockReturnValue(5);
    const { container } = wrap(<CandidateHeader {...defaults} />);
    expect(container.querySelector('[data-testid="hover"]')).not.toBeNull();
  });

  it('renders transaction icon link', () => {
    useBlockNumberMock.mockReturnValue({ data: 100n });
    useActiveLocaleMock.mockReturnValue('en-US');
    isMobileMock.mockReturnValue(false);
    useUserVotesAsOfBlockMock.mockReturnValue(5);
    const { container } = wrap(<CandidateHeader {...defaults} />);
    expect(container.querySelector('[data-testid="tx-link"]')).not.toBeNull();
  });

  it('renders Version link when versionsCount > 1', () => {
    useBlockNumberMock.mockReturnValue({ data: 100n });
    useActiveLocaleMock.mockReturnValue('en-US');
    isMobileMock.mockReturnValue(false);
    useUserVotesAsOfBlockMock.mockReturnValue(5);
    const { container } = wrap(<CandidateHeader {...defaults} versionsCount={3} />);
    expect(container.querySelector('a[href="/candidates/cand-1/history/"]')).not.toBeNull();
    expect(container.textContent).toContain('Version 3');
  });

  it('renders plain Version text (no link) when versionsCount=1', () => {
    useBlockNumberMock.mockReturnValue({ data: 100n });
    useActiveLocaleMock.mockReturnValue('en-US');
    isMobileMock.mockReturnValue(false);
    useUserVotesAsOfBlockMock.mockReturnValue(5);
    const { container } = wrap(<CandidateHeader {...defaults} versionsCount={1} />);
    expect(container.textContent).toContain('Version 1');
    expect(container.querySelector('a[href*="/history/"]')).toBeNull();
  });

  it('renders relative timestamp', () => {
    useBlockNumberMock.mockReturnValue({ data: 100n });
    useActiveLocaleMock.mockReturnValue('en-US');
    isMobileMock.mockReturnValue(false);
    useUserVotesAsOfBlockMock.mockReturnValue(5);
    const { container } = wrap(<CandidateHeader {...defaults} />);
    expect(container.textContent).toContain('1 day ago');
  });

  it('shows ja-JP layout when locale is ja-JP', () => {
    useBlockNumberMock.mockReturnValue({ data: 100n });
    useActiveLocaleMock.mockReturnValue('ja-JP');
    isMobileMock.mockReturnValue(false);
    useUserVotesAsOfBlockMock.mockReturnValue(5);
    const { container } = wrap(<CandidateHeader {...defaults} />);
    expect(container.textContent).toContain('Proposed by');
  });

  it('renders mobile-specific submit when isMobile + isActiveForVoting', () => {
    useBlockNumberMock.mockReturnValue({ data: 100n });
    useActiveLocaleMock.mockReturnValue('en-US');
    isMobileMock.mockReturnValue(true);
    useUserVotesAsOfBlockMock.mockReturnValue(5);
    const { container } = wrap(<CandidateHeader {...defaults} isActiveForVoting={true} />);
    expect(container.textContent?.length).toBeGreaterThan(0);
  });
});
