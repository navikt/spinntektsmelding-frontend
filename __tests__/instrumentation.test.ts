import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockListen = vi.fn();

vi.mock('../__mocks__/server.js', () => ({
  server: {
    listen: mockListen
  }
}));

describe('register', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    mockListen.mockClear();
    process.env = { ...originalEnv };
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should start MSW server when NEXT_RUNTIME is nodejs and NODE_ENV is development', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.NODE_ENV = 'development';

    const { register } = await import('../instrumentation');

    await register();

    expect(mockListen).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' });
    expect(console.log).toHaveBeenCalledWith('MSW server started for development');
  });

  it('should not start MSW server when NEXT_RUNTIME is not nodejs', async () => {
    process.env.NEXT_RUNTIME = 'edge';
    process.env.NODE_ENV = 'development';

    const { register } = await import('../instrumentation');

    await register();

    expect(mockListen).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should not start MSW server when NODE_ENV is not development', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.NODE_ENV = 'production';

    const { register } = await import('../instrumentation');

    await register();

    expect(mockListen).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should not start MSW server when both conditions are not met', async () => {
    process.env.NEXT_RUNTIME = 'edge';
    process.env.NODE_ENV = 'production';

    const { register } = await import('../instrumentation');

    await register();

    expect(mockListen).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });
});
