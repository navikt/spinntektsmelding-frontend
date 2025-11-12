import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { loadDecorator } from '../../pages/_document.js';
import Document from '../../pages/_document.js';

// Mock next/document with proper getInitialProps implementation
vi.mock('next/document', () => {
  const MockDocument = class MockDocument {
    static async getInitialProps(ctx: any) {
      if (ctx.renderPage) {
        ctx.renderPage();
      }
      return {
        styles: [],
        html: '',
        head: []
      };
    }
  };

  return {
    __esModule: true,
    default: MockDocument,
    Html: ({ children, lang }: any) => React.createElement('html', { lang }, children),
    Head: ({ children }: any) => React.createElement('head', {}, children),
    Main: () => React.createElement('div', { id: '__next' }),
    NextScript: () => React.createElement('script', { id: '__next-script' })
  };
});

function mockDecoratorModule(shouldThrow = false) {
  vi.doMock('@navikt/nav-dekoratoren-moduler/ssr', () => ({
    __esModule: true,
    fetchDecoratorReact: fetchDecoratorMock.mockImplementation(async () => {
      if (shouldThrow) throw new Error('Import-feil');
      return mockDecoratorComponents;
    })
  }));
}

vi.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => React.createElement('script', props, children)
}));

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
  vi.clearAllMocks();
});

describe('_document.tsx', () => {
  beforeEach(() => {
    vi.resetModules();
    mockDecoratorModule(false);
  });

  describe('Environment flags', () => {
    it('har riktige env-flagg for å deaktivere dekoratør', () => {
      process.env.NEXT_PUBLIC_DISABLE_DECORATOR = 'true';
      const shouldDisable =
        process.env.NEXT_PUBLIC_DISABLE_DECORATOR === 'true' ||
        process.env.NODE_ENV === 'test' ||
        process.env.PLAYWRIGHT === 'true';

      expect(shouldDisable).toBe(true);
    });

    it('NODE_ENV=test deaktiverer dekoratør', () => {
      process.env.NODE_ENV = 'test';
      const shouldDisable =
        process.env.NEXT_PUBLIC_DISABLE_DECORATOR === 'true' ||
        process.env.NODE_ENV === 'test' ||
        process.env.PLAYWRIGHT === 'true';

      expect(shouldDisable).toBe(true);
    });

    it('PLAYWRIGHT=true deaktiverer dekoratør', () => {
      process.env.PLAYWRIGHT = 'true';
      const shouldDisable =
        process.env.NEXT_PUBLIC_DISABLE_DECORATOR === 'true' ||
        process.env.NODE_ENV === 'test' ||
        process.env.PLAYWRIGHT === 'true';

      expect(shouldDisable).toBe(true);
    });

    it('should enable decorator when all flags are false', () => {
      delete process.env.NEXT_PUBLIC_DISABLE_DECORATOR;
      delete process.env.PLAYWRIGHT;
      process.env.NODE_ENV = 'production';

      const shouldDisable =
        process.env.NEXT_PUBLIC_DISABLE_DECORATOR === 'true' ||
        process.env.NODE_ENV === 'test' ||
        process.env.PLAYWRIGHT === 'true';

      expect(shouldDisable).toBe(false);
    });
  });

  describe('loadDecorator', () => {
    it('returnerer disabled når NEXT_PUBLIC_DISABLE_DECORATOR=true', async () => {
      process.env.NEXT_PUBLIC_DISABLE_DECORATOR = 'true';

      const result = await loadDecorator();

      expect(result.Header).toBeDefined();
      expect(result.Footer).toBeDefined();
      expect(result.Scripts).toBeDefined();
      expect(result.HeadAssets).toBeDefined();
    });

    it('returnerer disabled når NODE_ENV=test', async () => {
      process.env.NODE_ENV = 'test';
      delete process.env.NEXT_PUBLIC_DISABLE_DECORATOR;

      const result = await loadDecorator();

      expect(result.Header).toBeDefined();
    });

    it('should cache disabled decorator components', async () => {
      process.env.NEXT_PUBLIC_DISABLE_DECORATOR = 'true';

      const first = await loadDecorator();
      const second = await loadDecorator();

      expect(first).toBe(second);
      expect(fetchDecoratorMock).not.toHaveBeenCalled();
    });
  });

  describe('Document.getInitialProps', () => {
    it('should call parent getInitialProps', async () => {
      const ctx = {
        renderPage: vi.fn(() => ({ html: '', head: [] }))
      };

      const result = await Document.getInitialProps(ctx as any);

      expect(result).toHaveProperty('styles');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('head');
      expect(result).toHaveProperty('decorator');
    });

    it('should return decorator in initialProps', async () => {
      const ctx = {
        renderPage: vi.fn(() => ({ html: '', head: [] }))
      };

      const result = await Document.getInitialProps(ctx as any);

      expect(result.decorator).toHaveProperty('Header');
      expect(result.decorator).toHaveProperty('Footer');
      expect(result.decorator).toHaveProperty('Scripts');
      expect(result.decorator).toHaveProperty('HeadAssets');
    });
  });

  describe('Error handling', () => {
    it('should handle network error from fetchDecoratorReact', async () => {
      delete process.env.NEXT_PUBLIC_DISABLE_DECORATOR;
      process.env.NODE_ENV = 'production';

      process.env = { ...process.env, NODE_ENV: 'production' };

      vi.resetModules();
      fetchDecoratorMock.mockRejectedValueOnce(new Error('Network error'));

      const result = await loadDecorator();

      expect(result.Header).toBeDefined();
      expect(result.Footer).toBeDefined();
    });

    it('should cache error state', async () => {
      delete process.env.NEXT_PUBLIC_DISABLE_DECORATOR;
      process.env.NODE_ENV = 'production';

      process.env = { ...process.env, NODE_ENV: 'production' };

      vi.resetModules();
      fetchDecoratorMock.mockRejectedValue(new Error('Load error'));

      const first = await loadDecorator();
      fetchDecoratorMock.mockClear();
      const second = await loadDecorator();

      expect(first).toBe(second);
      expect(fetchDecoratorMock).not.toHaveBeenCalled();
    });
  });

  describe('Actual Document rendering', () => {
    it('should render complete HTML structure with lang="no"', () => {
      const decorator = {
        Header: () => React.createElement('header', { 'data-testid': 'header' }, 'HEADER'),
        Footer: () => React.createElement('footer', { 'data-testid': 'footer' }, 'FOOTER'),
        Scripts: () => React.createElement('script', { 'data-testid': 'scripts' }),
        HeadAssets: () => React.createElement('meta', { name: 'head-assets' })
      };

      const props = {
        __NEXT_DATA__: { props: {}, page: '/', query: {}, buildId: 'test' },
        dangerousAsPath: '/',
        docComponentsRendered: {},
        buildManifest: { pages: {}, devFiles: [], ampDevFiles: [], polyfillFiles: [], lowPriorityFiles: [] },
        ampPath: '',
        inAmpMode: false,
        isDevelopment: false,
        hybridAmp: false,
        staticMarkup: false,
        devOnlyCacheBusterQueryString: '',
        scriptLoader: {},
        locale: undefined,
        disableOptimizedLoading: false,
        styles: [],
        head: [],
        html: '<div>test</div>',
        decorator
      };

      const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Document, props));

      expect(html).toContain('lang="no"');
      expect(html).toContain('HEADER');
      expect(html).toContain('FOOTER');
    });

    it('should render with Umami script when env vars are set', () => {
      process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = 'test-id';
      process.env.NEXT_PUBLIC_UMAMI_DATA_DOMAINS = 'test.domain';

      const decorator = {
        Header: () => null,
        Footer: () => null,
        Scripts: () => null,
        HeadAssets: () => null
      };

      const props = {
        __NEXT_DATA__: { props: {}, page: '/', query: {}, buildId: 'test' },
        dangerousAsPath: '/',
        docComponentsRendered: {},
        buildManifest: { pages: {}, devFiles: [], ampDevFiles: [], polyfillFiles: [], lowPriorityFiles: [] },
        ampPath: '',
        inAmpMode: false,
        isDevelopment: false,
        hybridAmp: false,
        staticMarkup: false,
        devOnlyCacheBusterQueryString: '',
        scriptLoader: {},
        locale: undefined,
        disableOptimizedLoading: false,
        styles: [],
        head: [],
        html: '',
        decorator
      };

      const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Document, props));

      expect(html).toContain('sporing.js');
      expect(html).toContain('test-id');
      expect(html).toContain('test.domain');

      delete process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
      delete process.env.NEXT_PUBLIC_UMAMI_DATA_DOMAINS;
    });

    it('should not render Umami script when env vars are missing', () => {
      delete process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
      delete process.env.NEXT_PUBLIC_UMAMI_DATA_DOMAINS;

      const decorator = {
        Header: () => null,
        Footer: () => null,
        Scripts: () => null,
        HeadAssets: () => null
      };

      const props = {
        __NEXT_DATA__: { props: {}, page: '/', query: {}, buildId: 'test' },
        dangerousAsPath: '/',
        docComponentsRendered: {},
        buildManifest: { pages: {}, devFiles: [], ampDevFiles: [], polyfillFiles: [], lowPriorityFiles: [] },
        ampPath: '',
        inAmpMode: false,
        isDevelopment: false,
        hybridAmp: false,
        staticMarkup: false,
        devOnlyCacheBusterQueryString: '',
        scriptLoader: {},
        locale: undefined,
        disableOptimizedLoading: false,
        styles: [],
        head: [],
        html: '',
        decorator
      };

      const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Document, props));

      expect(html).not.toContain('umami.js');
    });

    it('should render HeadAssets in Head section', () => {
      const decorator = {
        Header: () => null,
        Footer: () => null,
        Scripts: () => null,
        HeadAssets: () => React.createElement('meta', { name: 'custom-head', content: 'test-value' })
      };

      const props = {
        __NEXT_DATA__: { props: {}, page: '/', query: {}, buildId: 'test' },
        dangerousAsPath: '/',
        docComponentsRendered: {},
        buildManifest: { pages: {}, devFiles: [], ampDevFiles: [], polyfillFiles: [], lowPriorityFiles: [] },
        ampPath: '',
        inAmpMode: false,
        isDevelopment: false,
        hybridAmp: false,
        staticMarkup: false,
        devOnlyCacheBusterQueryString: '',
        scriptLoader: {},
        locale: undefined,
        disableOptimizedLoading: false,
        styles: [],
        head: [],
        html: '',
        decorator
      };

      const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Document, props));

      expect(html).toContain('name="custom-head"');
      expect(html).toContain('content="test-value"');
    });

    it('should render body with id="body"', () => {
      const decorator = {
        Header: () => null,
        Footer: () => null,
        Scripts: () => null,
        HeadAssets: () => null
      };

      const props = {
        __NEXT_DATA__: { props: {}, page: '/', query: {}, buildId: 'test' },
        dangerousAsPath: '/',
        docComponentsRendered: {},
        buildManifest: { pages: {}, devFiles: [], ampDevFiles: [], polyfillFiles: [], lowPriorityFiles: [] },
        ampPath: '',
        inAmpMode: false,
        isDevelopment: false,
        hybridAmp: false,
        staticMarkup: false,
        devOnlyCacheBusterQueryString: '',
        scriptLoader: {},
        locale: undefined,
        disableOptimizedLoading: false,
        styles: [],
        head: [],
        html: '',
        decorator
      };

      const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Document, props));

      expect(html).toContain('id="body"');
    });

    it('should render all components in correct order', () => {
      const decorator = {
        Header: () => React.createElement('div', {}, 'HEADER'),
        Footer: () => React.createElement('div', {}, 'FOOTER'),
        Scripts: () => React.createElement('script', {}),
        HeadAssets: () => React.createElement('meta', { name: 'test' })
      };

      const props = {
        __NEXT_DATA__: { props: {}, page: '/', query: {}, buildId: 'test' },
        dangerousAsPath: '/',
        docComponentsRendered: {},
        buildManifest: { pages: {}, devFiles: [], ampDevFiles: [], polyfillFiles: [], lowPriorityFiles: [] },
        ampPath: '',
        inAmpMode: false,
        isDevelopment: false,
        hybridAmp: false,
        staticMarkup: false,
        devOnlyCacheBusterQueryString: '',
        scriptLoader: {},
        locale: undefined,
        disableOptimizedLoading: false,
        styles: [],
        head: [],
        html: '',
        decorator
      };

      const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Document, props));

      const headerIndex = html.indexOf('HEADER');
      const mainIndex = html.indexOf('id="__next"');
      const footerIndex = html.indexOf('FOOTER');

      expect(headerIndex).toBeLessThan(mainIndex);
      expect(mainIndex).toBeLessThan(footerIndex);
    });
  });

  describe('loadDecorator – disabled branch', () => {
    it('returnerer DisabledDecorator når NEXT_PUBLIC_DISABLE_DECORATOR=true', async () => {
      process.env.NEXT_PUBLIC_DISABLE_DECORATOR = 'true';
      vi.resetModules();

      const fetchSpy = vi.fn();
      vi.doMock('@navikt/nav-dekoratoren-moduler/ssr', () => ({
        __esModule: true,
        fetchDecoratorReact: fetchSpy
      }));

      const { loadDecorator } = await import('../../pages/_document');
      const decorator = await loadDecorator();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(decorator.Header({})).toBeNull();
      expect(decorator.Footer({})).toBeNull();
      expect(decorator.Scripts({})).toBeNull();
      expect(decorator.HeadAssets({})).toBeNull();
    });

    it('returnerer DisabledDecorator når NODE_ENV=test', async () => {
      process.env.NODE_ENV = 'test';
      delete process.env.NEXT_PUBLIC_DISABLE_DECORATOR;
      vi.resetModules();

      const fetchSpy = vi.fn();
      vi.doMock('@navikt/nav-dekoratoren-moduler/ssr', () => ({
        __esModule: true,
        fetchDecoratorReact: fetchSpy
      }));

      const { loadDecorator } = await import('../../pages/_document');
      const decorator = await loadDecorator();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(decorator.Header({})).toBeNull();
      expect(decorator.Footer({})).toBeNull();
      expect(decorator.Scripts({})).toBeNull();
      expect(decorator.HeadAssets({})).toBeNull();
    });
  });
});
