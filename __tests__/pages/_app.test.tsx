import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock CSS imports
vi.mock('../../styles/globals.css', () => ({}));
vi.mock('@navikt/ds-css', () => ({}));
vi.mock('../../styles/bedriftsmeny.css', () => ({}));
vi.mock('../../components/PageContent/PageContent.css', () => ({}));

// Mock immer
vi.mock('immer', () => ({
  enableMapSet: vi.fn()
}));

// Mock next-logger
const mockConfigureLogger = vi.fn();
vi.mock('@navikt/next-logger', () => ({
  configureLogger: mockConfigureLogger
}));

// Mock environment
vi.mock('../../config/environment', () => ({
  default: {
    baseUrl: '/test-base-url'
  }
}));

// Mock faro module
const mockInitInstrumentation = vi.fn();
const mockGetFaro = vi.fn();
const mockPinoLevelToFaroLevel = vi.fn();

vi.mock('../../utils/faro', () => ({
  initInstrumentation: mockInitInstrumentation,
  getFaro: mockGetFaro,
  pinoLevelToFaroLevel: mockPinoLevelToFaroLevel
}));

describe('_app', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockInitInstrumentation.mockClear();
    mockGetFaro.mockClear();
    mockPinoLevelToFaroLevel.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('App component', () => {
    it('should render the page component with pageProps', async () => {
      const { default: App } = await import('../../pages/_app');

      const TestComponent = ({ testProp }: { testProp: string }) => <div data-testid='test-component'>{testProp}</div>;

      render(<App Component={TestComponent} pageProps={{ testProp: 'Hello World' }} router={{} as any} />);

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should lazy load faro module on mount', async () => {
      const { default: App } = await import('../../pages/_app');

      const TestComponent = () => <div>Test</div>;

      render(<App Component={TestComponent} pageProps={{}} router={{} as any} />);

      await waitFor(() => {
        expect(mockInitInstrumentation).toHaveBeenCalled();
      });
    });

    it('should only initialize faro once even with re-renders', async () => {
      const { default: App } = await import('../../pages/_app');

      const TestComponent = () => <div>Test</div>;

      const { rerender } = render(<App Component={TestComponent} pageProps={{}} router={{} as any} />);

      await waitFor(() => {
        expect(mockInitInstrumentation).toHaveBeenCalled();
      });

      const callCountAfterFirstRender = mockInitInstrumentation.mock.calls.length;

      // Re-render the app
      rerender(<App Component={TestComponent} pageProps={{ updated: true }} router={{} as any} />);

      // Wait a bit and verify no additional calls
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not have been called again
      expect(mockInitInstrumentation).toHaveBeenCalledTimes(callCountAfterFirstRender);
    });
  });

  describe('configureLogger', () => {
    it('should configure logger with correct basePath', async () => {
      await import('../../pages/_app');

      expect(mockConfigureLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          basePath: '/test-base-url'
        })
      );
    });

    it('should configure logger with onLog callback', async () => {
      await import('../../pages/_app');

      expect(mockConfigureLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          onLog: expect.any(Function)
        })
      );
    });
  });

  describe('onLog callback', () => {
    it('should not push logs when faro module is not loaded', async () => {
      mockGetFaro.mockReturnValue(null);

      await import('../../pages/_app');

      const onLogCallback = mockConfigureLogger.mock.calls[0][0].onLog;
      const result = onLogCallback({
        messages: ['test message'],
        level: { label: 'info' }
      });

      expect(result).toBeUndefined();
    });

    it('should push logs to faro when faro is available', async () => {
      const mockPushLog = vi.fn();
      mockGetFaro.mockReturnValue({
        api: {
          pushLog: mockPushLog
        }
      });
      mockPinoLevelToFaroLevel.mockReturnValue('INFO');

      // Reset modules to get fresh import with mocked faro
      vi.resetModules();

      // Re-setup mocks after reset
      vi.doMock('../../styles/globals.css', () => ({}));
      vi.doMock('@navikt/ds-css', () => ({}));
      vi.doMock('../../styles/bedriftsmeny.css', () => ({}));
      vi.doMock('../../components/PageContent/PageContent.css', () => ({}));
      vi.doMock('immer', () => ({ enableMapSet: vi.fn() }));

      const localConfigureLogger = vi.fn();
      vi.doMock('@navikt/next-logger', () => ({
        configureLogger: localConfigureLogger
      }));

      vi.doMock('../../config/environment', () => ({
        default: { baseUrl: '/test' }
      }));

      vi.doMock('../../utils/faro', () => ({
        initInstrumentation: mockInitInstrumentation,
        getFaro: mockGetFaro,
        pinoLevelToFaroLevel: mockPinoLevelToFaroLevel
      }));

      const { default: App } = await import('../../pages/_app');

      // Render to trigger faro loading
      const TestComponent = () => <div>Test</div>;
      render(<App Component={TestComponent} pageProps={{}} router={{} as any} />);

      // Wait for faro to be loaded
      await waitFor(() => {
        expect(mockInitInstrumentation).toHaveBeenCalled();
      });

      // Now test the onLog callback
      const onLogCallback = localConfigureLogger.mock.calls[0][0].onLog;
      onLogCallback({
        messages: ['test message'],
        level: { label: 'info' }
      });

      expect(mockPinoLevelToFaroLevel).toHaveBeenCalledWith('info');
    });
  });

  describe('immer setup', () => {
    it('should enable MapSet support for immer', async () => {
      const { enableMapSet } = await import('immer');

      await import('../../pages/_app');

      expect(enableMapSet).toHaveBeenCalled();
    });
  });
});
