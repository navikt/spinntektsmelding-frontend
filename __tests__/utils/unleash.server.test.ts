import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, client, warn } = vi.hoisted(() => {
  return {
    createClient: vi.fn(),
    client: { start: vi.fn(), isEnabled: vi.fn(), isSynchronized: vi.fn(), destroy: vi.fn() },
    warn: vi.fn()
  };
});

vi.mock('@navikt/next-logger', () => ({ logger: { warn } }));
vi.mock('unleash-client', () => ({
  Unleash: class extends EventEmitter {
    start = client.start;
    isEnabled = client.isEnabled;
    isSynchronized = client.isSynchronized;
    destroy = client.destroy;
    constructor(options: unknown) {
      super();
      createClient(options);
    }
  }
}));

describe('server-side Unleash', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.stubEnv('UNLEASH_SERVER_API_URL', 'https://unleash.example/api');
    vi.stubEnv('UNLEASH_SERVER_API_TOKEN', 'synthetic-test-token');
    client.start.mockImplementation(function (this: EventEmitter) {
      this.emit('synchronized');
      return Promise.resolve();
    });
    client.isEnabled.mockReturnValue(true);
    client.isSynchronized.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('henter flagget ved lasting og stopper klienten etter hver evaluering', async () => {
    const { hentNyeSelvbestemteAlternativer } = await import('../../utils/unleash.server');

    expect(await hentNyeSelvbestemteAlternativer()).toBe(true);
    client.isSynchronized.mockReturnValue(false);
    expect(await hentNyeSelvbestemteAlternativer()).toBe(false);

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://unleash.example/api',
        customHeaders: { Authorization: 'synthetic-test-token' },
        timeout: 1500,
        disableMetrics: true,
        disableAutoStart: true
      })
    );
    expect(createClient).toHaveBeenCalledTimes(2);
    expect(client.destroy).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
    expect(client.isEnabled).toHaveBeenCalledWith('inntektsmelding-selvbestemt-alternativer', {}, false);
  });

  it.each(['UNLEASH_SERVER_API_URL', 'UNLEASH_SERVER_API_TOKEN'])('deaktiverer nye valg uten %s', async (missing) => {
    vi.stubEnv(missing, '');
    const { hentNyeSelvbestemteAlternativer } = await import('../../utils/unleash.server');

    expect(await hentNyeSelvbestemteAlternativer()).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it('stopper klienten etter maksimalt 1,5 sekund nar Unleash ikke svarer', async () => {
    client.start.mockImplementation(() => {
      return new Promise<void>(() => {});
    });
    client.isEnabled.mockReturnValue(false);
    const { hentNyeSelvbestemteAlternativer } = await import('../../utils/unleash.server');
    const evaluation = hentNyeSelvbestemteAlternativer();
    const resolved = vi.fn();
    void evaluation.then(resolved);

    await vi.advanceTimersByTimeAsync(1499);
    expect(resolved).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(await evaluation).toBe(false);

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(client.destroy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('deaktiverer flagget ved feil og logger uten sensitive SDK-detaljer', async () => {
    let emitter: EventEmitter;
    client.start.mockImplementation(function (this: EventEmitter) {
      emitter = this;
      this.emit('synchronized');
      return Promise.resolve();
    });
    const { hentNyeSelvbestemteAlternativer } = await import('../../utils/unleash.server');
    expect(await hentNyeSelvbestemteAlternativer()).toBe(true);

    emitter!.emit('error', new Error('sensitive-sdk-details'));
    emitter!.emit('warn', 'sensitive-sdk-details');
    client.isSynchronized.mockReturnValue(false);
    expect(await hentNyeSelvbestemteAlternativer()).toBe(false);
    client.isSynchronized.mockReturnValue(true);
    client.isEnabled.mockImplementation(() => {
      throw new Error('sensitive-sdk-details');
    });
    expect(await hentNyeSelvbestemteAlternativer()).toBe(false);
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('sensitive-sdk-details'));
    expect(client.destroy).toHaveBeenCalledTimes(3);
  });

  it('ignorerer tidligere aktivering og SDK-cache nar Unleash ikke svarer', async () => {
    const { hentNyeSelvbestemteAlternativer } = await import('../../utils/unleash.server');
    expect(await hentNyeSelvbestemteAlternativer()).toBe(true);
    client.isSynchronized.mockReturnValue(false);
    client.isEnabled.mockClear();

    expect(await hentNyeSelvbestemteAlternativer()).toBe(false);
    expect(client.isEnabled).not.toHaveBeenCalled();
    client.isSynchronized.mockReturnValue(true);
    client.isEnabled.mockReturnValue(false);
    expect(await hentNyeSelvbestemteAlternativer()).toBe(false);
  });

  it.each(['not-a-url', 'file:///tmp/unleash', 'https://user:password@unleash.example/api'])(
    'taler ugyldig serverkonfigurasjon %s',
    async (url) => {
      vi.stubEnv('UNLEASH_SERVER_API_URL', url);
      const { hentNyeSelvbestemteAlternativer } = await import('../../utils/unleash.server');

      expect(await hentNyeSelvbestemteAlternativer()).toBe(false);
      expect(createClient).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalled();
    }
  );

  it('lar ikke avvist oppstart stoppe siden', async () => {
    client.start.mockRejectedValue(new Error('synthetic-start-error'));
    client.isEnabled.mockReturnValue(false);
    const { hentNyeSelvbestemteAlternativer } = await import('../../utils/unleash.server');

    expect(await hentNyeSelvbestemteAlternativer()).toBe(false);
    expect(warn).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
