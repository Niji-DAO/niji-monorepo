import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const configState: { subgraphApiUri: string } = { subgraphApiUri: 'https://subgraph.example' };
vi.mock('@/config', () => ({
  default: {
    get app() {
      return { subgraphApiUri: configState.subgraphApiUri };
    },
  },
}));

import { execute } from './execute';

const mockFetch = vi.fn();

beforeEach(() => {
  configState.subgraphApiUri = 'https://subgraph.example';
  mockFetch.mockReset();
  global.fetch = mockFetch as never;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('execute', () => {
  it('returns undefined when subgraphApiUri is empty (fetch not called)', async () => {
    configState.subgraphApiUri = '';
    const result = await execute('query x { y }' as never);
    expect(result).toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls fetch with POST to subgraphApiUri', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: { foo: 1 } }) });
    await execute('query x { y }' as never);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://subgraph.example',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('passes Content-Type + Accept headers', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: {} }) });
    await execute('query' as never);
    const call = mockFetch.mock.calls[0][1];
    expect(call.headers['Content-Type']).toBe('application/json');
    expect(call.headers.Accept).toBe('application/graphql-response+json');
  });

  it('sends body with query + variables JSON-stringified', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: {} }) });
    await execute('query GetX { x }' as never, { id: '1' } as never);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.query).toBe('query GetX { x }');
    expect(body.variables).toEqual({ id: '1' });
  });

  it('returns data field from successful JSON response', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: { proposals: [1, 2] } }) });
    const result = await execute('query' as never);
    expect(result).toEqual({ proposals: [1, 2] });
  });

  it('throws when response.ok is false', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) });
    await expect(execute('query' as never)).rejects.toThrow('Network response was not ok');
  });
});
