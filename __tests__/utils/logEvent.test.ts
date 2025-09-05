import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import logEvent from '../../utils/logEvent';

// Mock environment so we can toggle amplitudeEnabled
vi.mock('../../config/environment', () => ({
  default: { amplitudeEnabled: true }
}));
import env from '../../config/environment';

// Mock logger
const warnSpy = vi.fn();
vi.mock('@navikt/next-logger', () => ({
  logger: { warn: (...args: any[]) => warnSpy(...args) }
}));

// Utility to ensure window exists in jsdom environment
function ensureWindow() {
  // @ts-ignore
  if (typeof window === 'undefined') global.window = {} as any;
}

describe('logEvent (umami)', () => {
  const eventName = 'knapp klikket' as const;
  const eventData = { button: 'Lagre', steg: '1' };

  beforeEach(() => {
    warnSpy.mockClear();
    ensureWindow();
  });

  afterEach(() => {
    // @ts-ignore
    if (window) delete (window as any).umami;
  });

  it('kaller umami.track når amplitudeEnabled=true og umami er tilgjengelig', () => {
    // @ts-ignore mutate mocked env
    env.amplitudeEnabled = true;
    const track = vi.fn();
    // @ts-ignore
    window.umami = { track };

    logEvent(eventName, eventData);

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(eventName, {
      ...eventData,
      app: 'inntektsmelding-sykepenger'
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('logger warning og avbryter når umami.track mangler', () => {
    // @ts-ignore
    env.amplitudeEnabled = true;
    // @ts-ignore
    window.umami = {}; // mangler track

    logEvent(eventName, eventData);

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('bruker console.log fallback når amplitudeEnabled=false', () => {
    // @ts-ignore
    env.amplitudeEnabled = false;
    const track = vi.fn();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // @ts-ignore
    window.umami = { track };

    logEvent(eventName, eventData);

    expect(track).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('Logger knapp klikket');
    logSpy.mockRestore();
  });

  it('gjør ingenting uten window (Node miljø)', () => {
    // Simuler manglende window
    // @ts-ignore
    const win = global.window;
    // @ts-ignore
    delete global.window;
    const track = vi.fn();
    logEvent(eventName, eventData); // skal ikke kaste
    // Re-set window
    // @ts-ignore
    global.window = win;
    expect(track).not.toHaveBeenCalled();
  });
});
