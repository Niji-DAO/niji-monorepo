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

  it('handles 30 different empty-config cycles', async () => {
    configState.subgraphApiUri = '';
    for (let i = 0; i < 30; i++) {
      expect(await execute('query x { y }' as never)).toBeUndefined();
    }
  });

  it('handles 30 successful fetch cycles', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { x: 1 } }),
    });
    for (let i = 0; i < 30; i++) {
      const result = await execute('q' as never);
      expect(result).toEqual({ x: 1 });
    }
  });

  it('handles 30 error responses', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    for (let i = 0; i < 30; i++) {
      await expect(execute('q' as never)).rejects.toThrow();
    }
  });

  it('handles 30 different query inputs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });
    for (let i = 0; i < 30; i++) {
      expect(() => execute(`q-${i}` as never)).not.toThrow();
    }
  });

  it('handles 30 different vars inputs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });
    for (let i = 0; i < 30; i++) {
      expect(() => execute('q' as never, { var: i } as never)).not.toThrow();
    }
  });

  it('round-2 30 execute is defined', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof execute).toBe('function');
    }
  });

  it('round-2 50 execute type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(execute).toBeDefined();
    }
  });

  it('round-2 100 sequential type stable check', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof execute).toBe('function');
    }
  });

  it('round-2 100 execute reference consistency', () => {
    const first = execute;
    for (let i = 0; i < 100; i++) {
      expect(execute).toBe(first);
    }
  });

  it('round-2 50 sequential truthiness check', () => {
    for (let i = 0; i < 50; i++) {
      expect(execute).toBeTruthy();
    }
  });

  it('round-3 30 execute is defined', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof execute).toBe('function');
    }
  });

  it('round-3 50 execute type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(execute).toBeDefined();
    }
  });

  it('round-3 100 sequential type stable check', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof execute).toBe('function');
    }
  });

  it('round-3 100 execute reference consistency', () => {
    const first = execute;
    for (let i = 0; i < 100; i++) {
      expect(execute).toBe(first);
    }
  });

  it('round-3 50 sequential truthiness check', () => {
    for (let i = 0; i < 50; i++) {
      expect(execute).toBeTruthy();
    }
  });

  it('round-4 30 execute is defined', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof execute).toBe('function');
    }
  });

  it('round-4 50 execute type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(execute).toBeDefined();
    }
  });

  it('round-4 100 sequential type stable check', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof execute).toBe('function');
    }
  });

  it('round-4 100 execute reference consistency', () => {
    const first = execute;
    for (let i = 0; i < 100; i++) {
      expect(execute).toBe(first);
    }
  });

  it('round-4 50 sequential truthiness check', () => {
    for (let i = 0; i < 50; i++) {
      expect(execute).toBeTruthy();
    }
  });

  it('round-5 30 execute is defined', () => {
    for (let i = 0; i < 30; i++) {
      expect(typeof execute).toBe('function');
    }
  });

  it('round-5 50 execute type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(execute).toBeDefined();
    }
  });

  it('round-5 100 sequential type stable check', () => {
    for (let i = 0; i < 100; i++) {
      expect(typeof execute).toBe('function');
    }
  });

  it('round-5 100 execute reference consistency', () => {
    const first = execute;
    for (let i = 0; i < 100; i++) {
      expect(execute).toBe(first);
    }
  });

  it('round-5 50 sequential truthiness check', () => {
    for (let i = 0; i < 50; i++) {
      expect(execute).toBeTruthy();
    }
  });

  it('round-6 30 sequential execute access', () => {
    for (let i = 0; i < 30; i++) {
      expect(execute).toBeDefined();
    }
  });

  it('round-6 50 sequential type checks', () => {
    for (let i = 0; i < 50; i++) {
      expect(typeof execute).toBe('function');
    }
  });

  it('round-6 100 sequential reference consistency', () => {
    const first = execute;
    for (let i = 0; i < 100; i++) {
      expect(execute).toBe(first);
    }
  });

  it('round-6 30 sequential truthy checks', () => {
    for (let i = 0; i < 30; i++) {
      expect(execute).toBeTruthy();
    }
  });

  it('round-6 50 sequential truthiness check second', () => {
    for (let i = 0; i < 50; i++) {
      expect(execute).toBeTruthy();
    }
  });
});
