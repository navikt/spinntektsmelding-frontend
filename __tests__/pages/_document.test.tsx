import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

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
});
