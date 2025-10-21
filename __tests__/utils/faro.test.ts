import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initInstrumentation, getFaro, pinoLevelToFaroLevel } from '../../utils/faro';
import { LogLevel } from '@grafana/faro-web-sdk';

// Mock @grafana/faro-web-sdk
vi.mock('@grafana/faro-web-sdk', () => ({
  initializeFaro: vi.fn(() => ({
    api: {
      pushLog: vi.fn(),
      pushError: vi.fn(),
      pushEvent: vi.fn()
    },
    config: {},
    pause: vi.fn(),
    unpause: vi.fn()
  })),
  getWebInstrumentations: vi.fn(() => []),
  LogLevel: {
    TRACE: 'trace',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  }
}));

// Mock @grafana/faro-web-tracing
vi.mock('@grafana/faro-web-tracing', () => ({
  TracingInstrumentation: vi.fn(() => ({}))
}));

// Mock environment
vi.mock('../../config/environment', () => ({
  default: {
    telemetryUrl: 'https://telemetry.example.com',
    version: '1.0.0'
  }
}));

describe('faro', () => {
  const originalWindow = global.window;
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to clear singleton
    vi.resetModules();

    // Mock window object
    global.window = {} as any;

    // Reset environment
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_DISABLE_DECORATOR;
  });

  afterEach(() => {
    global.window = originalWindow;
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('initInstrumentation', () => {
    it('should initialize Faro when window is defined', async () => {
      const { initInstrumentation, getFaro } = await import('../../utils/faro');

      initInstrumentation();

      const faro = getFaro();
      expect(faro).not.toBeNull();
      expect(faro).toHaveProperty('api');
    });

    it('should not initialize Faro when window is undefined', async () => {
      // @ts-ignore - intentionally setting to undefined
      global.window = undefined;

      const { initInstrumentation } = await import('../../utils/faro');

      initInstrumentation();

      // Should not throw and should handle gracefully
      expect(() => initInstrumentation()).not.toThrow();
    });

    // it('should not reinitialize Faro if already initialized', async () => {
    //   const { initInstrumentation, getFaro } = await import('../../utils/faro');
    //   const { initializeFaro } = await import('@grafana/faro-web-sdk');

    //   initInstrumentation();
    //   const firstFaro = getFaro();

    //   vi.clearAllMocks();

    //   initInstrumentation();
    //   const secondFaro = getFaro();

    //   expect(firstFaro).toBe(secondFaro);
    //   expect(initializeFaro).toHaveBeenCalledTimes(1);
    // });

    it('should return early when faro is already initialized', async () => {
      const { initInstrumentation } = await import('../../utils/faro');

      initInstrumentation();

      // Call again - should return early
      const result = initInstrumentation();

      expect(result).toBeUndefined();
    });
  });

  describe('getFaro', () => {
    it('should return null when NEXT_PUBLIC_DISABLE_DECORATOR is set', async () => {
      process.env.NEXT_PUBLIC_DISABLE_DECORATOR = 'true';

      vi.resetModules();
      const { getFaro } = await import('../../utils/faro');

      const faro = getFaro();

      expect(faro).toBeNull();
    });

    it('should return existing faro instance if already initialized', async () => {
      const { getFaro } = await import('../../utils/faro');

      const firstCall = getFaro();
      const secondCall = getFaro();

      expect(firstCall).toBe(secondCall);
      expect(firstCall).not.toBeNull();
    });

    it('should initialize Faro with correct configuration', async () => {
      const { getFaro } = await import('../../utils/faro');
      const { initializeFaro } = await import('@grafana/faro-web-sdk');

      getFaro();

      expect(initializeFaro).toHaveBeenCalledWith({
        url: 'https://telemetry.example.com',
        app: {
          name: 'spinntektsmelding-frontend',
          version: '1.0.0'
        },
        instrumentations: expect.arrayContaining([expect.any(Object)])
      });
    });

    it('should include web instrumentations with captureConsole disabled', async () => {
      const { getFaro } = await import('../../utils/faro');
      const { getWebInstrumentations } = await import('@grafana/faro-web-sdk');

      getFaro();

      expect(getWebInstrumentations).toHaveBeenCalledWith({
        captureConsole: false
      });
    });

    it('should include TracingInstrumentation', async () => {
      const { getFaro } = await import('../../utils/faro');
      const { TracingInstrumentation } = await import('@grafana/faro-web-tracing');

      getFaro();

      expect(TracingInstrumentation).toHaveBeenCalled();
    });

    it('should return null when decorator is disabled and faro is null', async () => {
      process.env.NEXT_PUBLIC_DISABLE_DECORATOR = 'true';
      vi.resetModules();

      const { getFaro } = await import('../../utils/faro');

      const result = getFaro();
      expect(result).toBeNull();
    });

    it('should return existing faro even when called multiple times', async () => {
      const { getFaro } = await import('../../utils/faro');
      const { initializeFaro } = await import('@grafana/faro-web-sdk');

      getFaro();
      getFaro();
      getFaro();

      // Should only initialize once
      expect(initializeFaro).toHaveBeenCalledTimes(1);
    });
  });

  describe('pinoLevelToFaroLevel', () => {
    it('should convert trace level', () => {
      expect(pinoLevelToFaroLevel('trace')).toBe(LogLevel.TRACE);
    });

    it('should convert debug level', () => {
      expect(pinoLevelToFaroLevel('debug')).toBe(LogLevel.DEBUG);
    });

    it('should convert info level', () => {
      expect(pinoLevelToFaroLevel('info')).toBe(LogLevel.INFO);
    });

    it('should convert warn level', () => {
      expect(pinoLevelToFaroLevel('warn')).toBe(LogLevel.WARN);
    });

    it('should convert error level', () => {
      expect(pinoLevelToFaroLevel('error')).toBe(LogLevel.ERROR);
    });

    it('should throw error for unknown level', () => {
      expect(() => pinoLevelToFaroLevel('unknown')).toThrow('Unknown level: unknown');
    });

    it('should throw error for invalid level', () => {
      expect(() => pinoLevelToFaroLevel('fatal')).toThrow('Unknown level: fatal');
    });

    it('should throw error for empty string', () => {
      expect(() => pinoLevelToFaroLevel('')).toThrow('Unknown level: ');
    });

    it('should throw error for numeric string', () => {
      expect(() => pinoLevelToFaroLevel('10')).toThrow('Unknown level: 10');
    });

    it('should be case sensitive', () => {
      expect(() => pinoLevelToFaroLevel('INFO')).toThrow('Unknown level: INFO');
      expect(() => pinoLevelToFaroLevel('Error')).toThrow('Unknown level: Error');
      expect(() => pinoLevelToFaroLevel('WARN')).toThrow('Unknown level: WARN');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle multiple initInstrumentation calls gracefully', async () => {
      const { initInstrumentation } = await import('../../utils/faro');

      expect(() => {
        initInstrumentation();
        initInstrumentation();
        initInstrumentation();
      }).not.toThrow();
    });

    it('should handle getFaro after initInstrumentation', async () => {
      const { initInstrumentation, getFaro } = await import('../../utils/faro');

      initInstrumentation();
      const faro = getFaro();

      expect(faro).not.toBeNull();
      expect(faro).toBe(getFaro());
    });

    it('should handle missing telemetryUrl', async () => {
      vi.resetModules();
      vi.doMock('../../config/environment', () => ({
        default: {
          telemetryUrl: undefined,
          version: '1.0.0'
        }
      }));

      const { getFaro } = await import('../../utils/faro');
      const { initializeFaro } = await import('@grafana/faro-web-sdk');

      getFaro();

      expect(initializeFaro).toHaveBeenCalledWith(
        expect.objectContaining({
          url: undefined
        })
      );
    });

    it('should handle missing version', async () => {
      vi.resetModules();
      vi.doMock('../../config/environment', () => ({
        default: {
          telemetryUrl: 'https://telemetry.example.com',
          version: undefined
        }
      }));

      const { getFaro } = await import('../../utils/faro');
      const { initializeFaro } = await import('@grafana/faro-web-sdk');

      getFaro();

      expect(initializeFaro).toHaveBeenCalledWith(
        expect.objectContaining({
          app: expect.objectContaining({
            version: undefined
          })
        })
      );
    });
  });

  describe('Server-side behavior', () => {
    it('should not initialize on server side (window undefined)', async () => {
      // @ts-ignore
      global.window = undefined;

      vi.resetModules();
      const { initInstrumentation, getFaro } = await import('../../utils/faro');

      initInstrumentation();

      // On server, getFaro should handle gracefully
      expect(() => getFaro()).not.toThrow();
    });

    it('should return early from initInstrumentation when window is undefined', async () => {
      // @ts-ignore
      global.window = undefined;

      vi.resetModules();
      const { initInstrumentation } = await import('../../utils/faro');
      const { initializeFaro } = await import('@grafana/faro-web-sdk');

      const result = initInstrumentation();

      expect(result).toBeUndefined();
      expect(initializeFaro).not.toHaveBeenCalled();
    });
  });

  describe('Singleton pattern', () => {
    it('should maintain singleton across multiple imports', async () => {
      vi.resetModules();

      const module1 = await import('../../utils/faro');
      const faro1 = module1.getFaro();

      const module2 = await import('../../utils/faro');
      const faro2 = module2.getFaro();

      expect(faro1).toBe(faro2);
    });

    it('should not reinitialize after first getFaro call', async () => {
      const { getFaro } = await import('../../utils/faro');
      const { initializeFaro } = await import('@grafana/faro-web-sdk');

      getFaro();
      const callCount = (initializeFaro as any).mock.calls.length;

      getFaro();
      getFaro();

      expect((initializeFaro as any).mock.calls.length).toBe(callCount);
    });
  });

  describe('Configuration validation', () => {
    it('should use correct app name', async () => {
      const { getFaro } = await import('../../utils/faro');
      const { initializeFaro } = await import('@grafana/faro-web-sdk');

      getFaro();

      expect(initializeFaro).toHaveBeenCalledWith(
        expect.objectContaining({
          app: expect.objectContaining({
            name: 'spinntektsmelding-frontend'
          })
        })
      );
    });

    it('should have captureConsole set to false', async () => {
      const { getFaro } = await import('../../utils/faro');
      const { getWebInstrumentations } = await import('@grafana/faro-web-sdk');

      getFaro();

      expect(getWebInstrumentations).toHaveBeenCalledWith(
        expect.objectContaining({
          captureConsole: false
        })
      );
    });
  });
});
