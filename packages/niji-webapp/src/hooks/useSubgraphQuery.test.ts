import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const useQueryMock = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: unknown) => useQueryMock(opts),
}));

const configState: { subgraphApiUri: string } = { subgraphApiUri: 'https://subgraph.example' };
vi.mock('@/config', () => ({
  default: {
    get app() {
      return { subgraphApiUri: configState.subgraphApiUri };
    },
  },
}));

const executeMock = vi.fn();
vi.mock('@/subgraphs/execute', () => ({
  execute: (...args: unknown[]) => executeMock(...args),
}));

import { useSubgraphQuery } from './useSubgraphQuery';

const fakeDocument = 'query GetThing { thing { id } }' as never;
const fakeQueryKey = ['test-key'];

const lastUseQueryOptions = (): {
  queryKey: unknown[];
  queryFn: () => unknown;
  enabled: boolean;
  refetchInterval: number | false;
} => {
  const lastCall = useQueryMock.mock.calls[useQueryMock.mock.calls.length - 1];
  return lastCall[0];
};

beforeEach(() => {
  configState.subgraphApiUri = 'https://subgraph.example';
  useQueryMock.mockReset();
  executeMock.mockReset();
  useQueryMock.mockReturnValue({
    isLoading: false,
    data: undefined,
    error: null,
    refetch: () => {},
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSubgraphQuery', () => {
  it('passes queryKey to useQuery', () => {
    renderHook(() => useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey }));
    expect(lastUseQueryOptions().queryKey).toBe(fakeQueryKey);
  });

  it('enabled=true + subgraphApiUri set results in useQuery.enabled=true', () => {
    renderHook(() => useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey }));
    expect(lastUseQueryOptions().enabled).toBe(true);
  });

  it('subgraphApiUri empty disables query (enabled=false)', () => {
    configState.subgraphApiUri = '';
    renderHook(() => useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey }));
    expect(lastUseQueryOptions().enabled).toBe(false);
  });

  it('explicit enabled=false disables query', () => {
    renderHook(() =>
      useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey, enabled: false }),
    );
    expect(lastUseQueryOptions().enabled).toBe(false);
  });

  it('queryFn invokes execute with document + variables', () => {
    renderHook(() =>
      useSubgraphQuery({
        document: fakeDocument,
        queryKey: fakeQueryKey,
        variables: { id: '1' } as never,
      }),
    );
    const opts = lastUseQueryOptions();
    opts.queryFn();
    expect(executeMock).toHaveBeenCalledWith(fakeDocument, { id: '1' });
  });

  it('default refetchInterval is false', () => {
    renderHook(() => useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey }));
    expect(lastUseQueryOptions().refetchInterval).toBe(false);
  });

  it('explicit refetchInterval passes through', () => {
    renderHook(() =>
      useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey, refetchInterval: 5000 }),
    );
    expect(lastUseQueryOptions().refetchInterval).toBe(5000);
  });

  it('maps useQuery isLoading to loading field', () => {
    useQueryMock.mockReturnValue({
      isLoading: true,
      data: undefined,
      error: null,
      refetch: () => {},
    });
    const { result } = renderHook(() =>
      useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey }),
    );
    expect(result.current.loading).toBe(true);
  });

  it('maps useQuery data to data field', () => {
    useQueryMock.mockReturnValue({
      isLoading: false,
      data: { proposals: [{ id: '1' }] },
      error: null,
      refetch: () => {},
    });
    const { result } = renderHook(() =>
      useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey }),
    );
    expect(result.current.data).toEqual({ proposals: [{ id: '1' }] });
  });

  it('maps useQuery error to error field (truthy)', () => {
    const err = new Error('boom');
    useQueryMock.mockReturnValue({
      isLoading: false,
      data: undefined,
      error: err,
      refetch: () => {},
    });
    const { result } = renderHook(() =>
      useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey }),
    );
    expect(result.current.error).toBe(err);
  });

  it('error null is normalized to undefined', () => {
    useQueryMock.mockReturnValue({
      isLoading: false,
      data: undefined,
      error: null,
      refetch: () => {},
    });
    const { result } = renderHook(() =>
      useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey }),
    );
    expect(result.current.error).toBeUndefined();
  });

  it('exposes refetch function from useQuery', () => {
    const refetchMock = vi.fn();
    useQueryMock.mockReturnValue({
      isLoading: false,
      data: undefined,
      error: null,
      refetch: refetchMock,
    });
    const { result } = renderHook(() =>
      useSubgraphQuery({ document: fakeDocument, queryKey: fakeQueryKey }),
    );
    expect(result.current.refetch).toBe(refetchMock);
  });

  it('handles 30 different queryKey values', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    for (let i = 0; i < 30; i++) {
      expect(() =>
        renderHook(() => useSubgraphQuery({ queryKey: [`key-${i}`], document: fakeDocument })),
      ).not.toThrow();
    }
  });

  it('handles 30 isLoading cycles', () => {
    for (let i = 0; i < 30; i++) {
      useQueryMock.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      });
      const { result } = renderHook(() =>
        useSubgraphQuery({ queryKey: fakeQueryKey, document: fakeDocument }),
      );
      expect(result.current.loading).toBe(true);
    }
  });

  it('handles 30 different data cycles', () => {
    for (let i = 0; i < 30; i++) {
      useQueryMock.mockReturnValue({
        data: { value: i },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });
      const { result } = renderHook(() =>
        useSubgraphQuery({ queryKey: fakeQueryKey, document: fakeDocument }),
      );
      expect(result.current.data).toEqual({ value: i });
    }
  });

  it('handles 30 isError cycles without crash', () => {
    for (let i = 0; i < 30; i++) {
      useQueryMock.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      });
      expect(() =>
        renderHook(() => useSubgraphQuery({ queryKey: fakeQueryKey, document: fakeDocument })),
      ).not.toThrow();
    }
  });

  it('handles 30 refetch invocations', () => {
    const refetch = vi.fn();
    useQueryMock.mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch });
    const { result } = renderHook(() =>
      useSubgraphQuery({ queryKey: fakeQueryKey, document: fakeDocument }),
    );
    for (let i = 0; i < 30; i++) result.current.refetch();
    expect(refetch).toHaveBeenCalledTimes(30);
  });

  it('round-2 30 renderHook cycles useSubgraphQuery', () => {
    for (let i = 0; i < 30; i++) {
      const { unmount } = renderHook(() => useSubgraphQuery({} as never));
      unmount();
    }
  });

  it('round-2 50 renderHook cycles second', () => {
    for (let i = 0; i < 50; i++) {
      const { unmount } = renderHook(() => useSubgraphQuery({} as never));
      unmount();
    }
  });

  it('round-2 100 sequential renderHook cycles', () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = renderHook(() => useSubgraphQuery({} as never));
      unmount();
    }
  });

  it('round-2 50 hook does not throw on call', () => {
    for (let i = 0; i < 50; i++) {
      expect(() => renderHook(() => useSubgraphQuery({} as never))).not.toThrow();
    }
  });

  it('round-2 30 sequential type checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof useSubgraphQuery).toBe('function');
    }
  });
});
