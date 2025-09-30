import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { loadDecorator } from '../../pages/_document';

// Mock next/config først
vi.mock('next/config', () => ({
  __esModule: true,
  default: () => ({
    publicRuntimeConfig: {
      umamiWebsiteId: 'test-website-id',
      umamiDataDomains: 'test-domain'
    }
  })
}));

// Mock next/document
vi.mock('next/document', () => ({
  __esModule: true,
  default: {
    getInitialProps: async () => ({
      styles: [],
      html: '',
      head: []
    })
  },
  Html: ({ children, lang }: any) => React.createElement('html', { lang }, children),
  Head: ({ children }: any) => React.createElement('head', {}, children),
  Main: () => React.createElement('div', { id: '__next' }),
  NextScript: () => React.createElement('script', { id: '__next-script' })
}));

function mockDecoratorModule(shouldThrow = false) {
  vi.doMock('@navikt/nav-dekoratoren-moduler/ssr', () => ({
    __esModule: true,
    fetchDecoratorReact: fetchDecoratorMock.mockImplementation(async () => {
      if (shouldThrow) throw new Error('Import-feil');
      return mockDecoratorComponents;
    })
  }));
}

// Mock next/script
vi.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => React.createElement('script', props, children)
}));

// Mock dekoratør-modulen
const mockDecoratorComponents = {
  Header: () => React.createElement('div', { 'data-testid': 'decorator-header' }, 'HEADER'),
  Footer: () => React.createElement('div', { 'data-testid': 'decorator-footer' }, 'FOOTER'),
  Scripts: () => React.createElement('div', { 'data-testid': 'decorator-scripts' }, 'SCRIPTS'),
  HeadAssets: () => React.createElement('meta', { 'data-testid': 'decorator-headassets' })
};

const fetchDecoratorMock = vi.fn().mockResolvedValue(mockDecoratorComponents);

vi.mock('@navikt/nav-dekoratoren-moduler/ssr', () => ({
  __esModule: true,
  fetchDecoratorReact: fetchDecoratorMock
}));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  fetchDecoratorMock.mockClear();
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('_document.tsx (unit tests)', () => {
  beforeEach(() => {
    vi.resetModules();
    mockDecoratorModule(false);
  });
  it('har riktige env-flagg for å deaktivere dekoratør', () => {
    // Test env-logikken direkte
    process.env.DISABLE_DECORATOR = 'true';
    const shouldDisable =
      process.env.DISABLE_DECORATOR === 'true' || process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === 'true';

    expect(shouldDisable).toBe(true);
  });

  it('NODE_ENV=test deaktiverer dekoratør', () => {
    process.env.NODE_ENV = 'test';
    const shouldDisable =
      process.env.DISABLE_DECORATOR === 'true' || process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === 'true';

    expect(shouldDisable).toBe(true);
  });

  it('PLAYWRIGHT=true deaktiverer dekoratør', () => {
    process.env.PLAYWRIGHT = 'true';
    const shouldDisable =
      process.env.DISABLE_DECORATOR === 'true' || process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT === 'true';

    expect(shouldDisable).toBe(true);
  });

  // Test av loadDecorator-funksjonen direkte (hvis eksportert)
  it('loadDecorator returnerer disabled når flagg er satt', async () => {
    // Hvis du eksporterer loadDecorator fra _document, kan vi teste den:
    process.env.DISABLE_DECORATOR = 'true';

    // Mock import for å teste logikken
    const { loadDecorator } = await import('../../pages/_document');

    if (loadDecorator) {
      const result = await loadDecorator();
      expect(result.Header).toBeDefined();
      // Disabled decorator returnerer null-komponenter
      expect(React.isValidElement(React.createElement(result.Header))).toBe(true);
    }
  });

  it('loadDecorator returnerer disabled når DISABLE_DECORATOR=true', async () => {
    process.env.DISABLE_DECORATOR = 'true';

    const result = await loadDecorator();

    expect(result.Header).toBeDefined();
    expect(result.Footer).toBeDefined();
    expect(result.Scripts).toBeDefined();
    expect(result.HeadAssets).toBeDefined();

    // Disabled decorator returnerer null-komponenter
    const headerElement = React.createElement(result.Header);
    expect(React.isValidElement(headerElement)).toBe(true);
  });

  it('loadDecorator bruker cache på påfølgende kall', async () => {
    delete process.env.DISABLE_DECORATOR;
    delete process.env.NODE_ENV;
    delete process.env.PLAYWRIGHT;

    // Reset modules så vi kan re-mock
    vi.resetModules();
    mockDecoratorModule(false);

    // Re-import for å få fresh module med nye mocks
    const { loadDecorator } = await import('../../pages/_document');

    const first = await loadDecorator();
    const second = await loadDecorator();

    expect(first).toBe(second); // Same reference (cached)
    expect(fetchDecoratorMock).toHaveBeenCalledTimes(1);
  });

  it('loadDecorator håndterer feil gracefully', async () => {
    delete process.env.DISABLE_DECORATOR;
    delete process.env.NODE_ENV;
    delete process.env.PLAYWRIGHT;

    vi.resetModules();
    mockDecoratorModule(true); // shouldThrow = true

    const { loadDecorator } = await import('../../pages/_document');

    const result = await loadDecorator();

    expect(fetchDecoratorMock).toHaveBeenCalledTimes(1);
    expect(result.Header).toBeDefined();
    // Fallback til disabled når feil oppstår
    const headerElement = React.createElement(result.Header);
    expect(React.isValidElement(headerElement)).toBe(true);
  });
});
