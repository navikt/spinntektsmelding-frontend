import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LogLevel } from '@grafana/faro-web-sdk';

// Use vi.hoisted() to make mocks available during hoisting
const { mockInitializeFaro, mockGetWebInstrumentations, mockTracingInstrumentation } = vi.hoisted(() => {
  const MockTracingInstrumentationClass = vi.fn(function (this: any) {});

  return {
    mockInitializeFaro: vi.fn(() => ({
      api: {
        pushLog: vi.fn(),
        pushError: vi.fn(),
        pushEvent: vi.fn()
      },
      config: {},
      pause: vi.fn(),
      unpause: vi.fn()
    })),
    mockGetWebInstrumentations: vi.fn(() => []),
    mockTracingInstrumentation: MockTracingInstrumentationClass
  };
});

vi.mock('@grafana/faro-web-sdk', () => ({
  initializeFaro: mockInitializeFaro,
  getWebInstrumentations: mockGetWebInstrumentations,
  LogLevel: {
    TRACE: 'trace',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  }
}));

vi.mock('@grafana/faro-web-tracing', () => ({
  TracingInstrumentation: mockTracingInstrumentation
}));

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
    global.window = {} as any;
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_DISABLE_DECORATOR;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
    process.env = originalEnv;
  });

  // Tests that DON'T need isolation (pinoLevelToFaroLevel is pure function)
  describe('pinoLevelToFaroLevel', () => {
    it('should convert trace level', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(pinoLevelToFaroLevel('trace')).toBe(LogLevel.TRACE);
    });

    it('should convert debug level', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(pinoLevelToFaroLevel('debug')).toBe(LogLevel.DEBUG);
    });

    it('should convert info level', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(pinoLevelToFaroLevel('info')).toBe(LogLevel.INFO);
    });

    it('should convert warn level', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(pinoLevelToFaroLevel('warn')).toBe(LogLevel.WARN);
    });

    it('should convert error level', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(pinoLevelToFaroLevel('error')).toBe(LogLevel.ERROR);
    });

    it('should throw error for unknown level', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(() => pinoLevelToFaroLevel('unknown')).toThrow('Unknown level: unknown');
    });

    it('should throw error for invalid level', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(() => pinoLevelToFaroLevel('fatal')).toThrow('Unknown level: fatal');
    });

    it('should throw error for empty string', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(() => pinoLevelToFaroLevel('')).toThrow('Unknown level: ');
    });

    it('should throw error for numeric string', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(() => pinoLevelToFaroLevel('10')).toThrow('Unknown level: 10');
    });

    it('should be case sensitive', async () => {
      const { pinoLevelToFaroLevel } = await import('../../utils/faro');
      expect(() => pinoLevelToFaroLevel('INFO')).toThrow('Unknown level: INFO');
      expect(() => pinoLevelToFaroLevel('Error')).toThrow('Unknown level: Error');
      expect(() => pinoLevelToFaroLevel('WARN')).toThrow('Unknown level: WARN');
    });
  });

  // Tests that NEED isolation - each in own describe with resetModules
  describe('initInstrumentation - isolated', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should initialize Faro when window is defined', async () => {
      const { initInstrumentation, getFaro } = await import('../../utils/faro');
      initInstrumentation();
      const faro = getFaro();
      expect(faro).not.toBeNull();
      expect(faro).toHaveProperty('api');
    });
  });

  describe('initInstrumentation - window undefined', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should not initialize Faro when window is undefined', async () => {
      // @ts-ignore
      global.window = undefined;
      const { initInstrumentation } = await import('../../utils/faro');
      expect(() => initInstrumentation()).not.toThrow();
    });
  });

  describe('initInstrumentation - already initialized', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should return early when faro is already initialized', async () => {
      const { initInstrumentation, getFaro } = await import('../../utils/faro');
      initInstrumentation();
      getFaro();
      const result = initInstrumentation();
      expect(result).toBeUndefined();
    });
  });

  describe('getFaro - TracingInstrumentation', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should include TracingInstrumentation', async () => {
      const { getFaro } = await import('../../utils/faro');
      getFaro();
      expect(mockTracingInstrumentation).toHaveBeenCalled();
    });
  });

  describe('getFaro - singleton', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should return existing faro instance if already initialized', async () => {
      const { getFaro } = await import('../../utils/faro');
      const firstCall = getFaro();
      const secondCall = getFaro();
      expect(firstCall).toBe(secondCall);
      expect(firstCall).not.toBeNull();
    });
  });

  describe('getFaro - configuration', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should initialize Faro with correct configuration', async () => {
      const { getFaro } = await import('../../utils/faro');
      getFaro();
      expect(mockInitializeFaro).toHaveBeenCalledWith({
        url: 'https://telemetry.example.com',
        app: {
          name: 'spinntektsmelding-frontend',
          version: '1.0.0'
        },
        instrumentations: expect.arrayContaining([expect.any(Object)])
      });
    });

    it('should return null if NEXT_PUBLIC_DISABLE_DECORATOR is set', async () => {
      process.env.NEXT_PUBLIC_DISABLE_DECORATOR = 'true';
      const { getFaro } = await import('../../utils/faro');
      const faro = getFaro();
      expect(faro).toBeNull();
    });
  });

  describe('getFaro - web instrumentations', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should include web instrumentations with captureConsole disabled', async () => {
      const { getFaro } = await import('../../utils/faro');
      getFaro();
      expect(mockGetWebInstrumentations).toHaveBeenCalledWith({
        captureConsole: false
      });
    });
  });

  describe('getFaro - multiple calls', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('should return existing faro even when called multiple times', async () => {
      const { getFaro } = await import('../../utils/faro');
      getFaro();
      vi.clearAllMocks();
      getFaro();
      getFaro();
      expect(mockInitializeFaro).not.toHaveBeenCalled();
    });
  });
});
