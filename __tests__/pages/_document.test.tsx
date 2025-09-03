import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setConfig } from 'next/config';

// Mock next/script to render a plain <script> element we can query
vi.mock('next/script', () => ({
  __esModule: true,
  default: (props: any) => <script {...props} />
}));

// Mock next/document: keep basic tags and stub getInitialProps so we don't need a real Next ctx
const mockedGetInitialProps = vi.fn(async () => ({ initialProps: true }));
vi.mock('next/document', () => ({
  __esModule: true,
  default: { getInitialProps: mockedGetInitialProps },
  Html: ({ children, ...props }: any) => <html {...props}>{children}</html>,
  Head: ({ children }: any) => <>{children}</>,
  Main: (props: any) => <main {...props} />,
  NextScript: (props: any) => <script data-testid='next-script' {...props} />
}));

// Mock NAV dekoratør SSR to provide simple components and capture calls
const mockedFetchDecoratorReact = vi.fn(async () => ({
  HeadAssets: () => null,
  Header: () => <div>Header</div>,
  Footer: () => <div>Footer</div>,
  Scripts: () => <div>Scripts</div>
}));
vi.mock('@navikt/nav-dekoratoren-moduler/ssr', () => ({
  __esModule: true,
  fetchDecoratorReact: mockedFetchDecoratorReact
}));

// Helper to import the module fresh after setting config
async function importDocumentModule() {
  // Ensure a clean module graph so _document reads fresh serverRuntimeConfig at import time
  vi.resetModules();
  // Reapply our persistent mocks after reset
  vi.doMock('next/script', () => ({ __esModule: true, default: (props: any) => <script {...props} /> }));
  vi.doMock('next/document', () => ({
    __esModule: true,
    default: { getInitialProps: mockedGetInitialProps },
    Html: ({ children, ...props }: any) => <html {...props}>{children}</html>,
    Head: ({ children }: any) => <>{children}</>,
    Main: (props: any) => <main {...props} />,
    NextScript: (props: any) => <script data-testid='next-script' {...props} />
  }));
  vi.doMock('@navikt/nav-dekoratoren-moduler/ssr', () => ({
    __esModule: true,
    fetchDecoratorReact: mockedFetchDecoratorReact
  }));

  return await import('../../pages/_document.js');
}

beforeEach(() => {
  // Reset spies between tests
  mockedGetInitialProps.mockClear();
  mockedFetchDecoratorReact.mockClear();
});

describe('pages/_document', () => {
  it('getInitialProps calls fetchDecoratorReact with expected params and returns Decorator', async () => {
    setConfig({
      publicRuntimeConfig: {},
      serverRuntimeConfig: { decoratorEnv: 'q1' }
    });

    const mod: any = await importDocumentModule();

    const result = await mod.default.getInitialProps({} as any);

    expect(mockedGetInitialProps).toHaveBeenCalledTimes(1);
    expect(mockedFetchDecoratorReact).toHaveBeenCalledWith({
      env: 'q1',
      params: { context: 'arbeidsgiver', chatbot: false, feedback: false }
    });

    expect(result).toHaveProperty('Decorator');
    // Includes spread initial props from NextDocument.getInitialProps mock
    expect(result).toMatchObject({ initialProps: true });
  });

  it('renders NAV decorator when not disabled and includes Umami script with attributes', async () => {
    setConfig({
      publicRuntimeConfig: {},
      serverRuntimeConfig: {
        decoratorDisabled: false,
        umamiWebsiteId: 'web-123',
        umamiDataDomains: 'nav.no'
      }
    });

    const mod: any = await importDocumentModule();
    const Decorator = await mockedFetchDecoratorReact();

    render(<mod.default Decorator={Decorator} />);

    // Decorator components present
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByText('Scripts')).toBeInTheDocument();

    // Umami script present with expected attributes
    const scripts = Array.from(document.querySelectorAll('script')) as HTMLScriptElement[];
    const umamiScript = scripts.find((s) => s.src === 'https://cdn.nav.no/team-researchops/sporing/sporing.js');
    expect(umamiScript).toBeTruthy();
    expect(umamiScript!.getAttribute('data-host-url')).toBe('https://umami.nav.no');
    expect(umamiScript!.getAttribute('data-website-id')).toBe('web-123');
    expect(umamiScript!.getAttribute('data-domains')).toBe('nav.no');
    expect(umamiScript!.defer).toBe(true);
  });

  it('does not render NAV decorator when disabled', async () => {
    setConfig({
      publicRuntimeConfig: {},
      serverRuntimeConfig: {
        decoratorDisabled: true,
        umamiWebsiteId: 'web-123',
        umamiDataDomains: 'nav.no'
      }
    });

    const mod: any = await importDocumentModule();
    const Decorator = await mockedFetchDecoratorReact();

    render(<mod.default Decorator={Decorator} />);

    expect(screen.queryByText('Header')).not.toBeInTheDocument();
    expect(screen.queryByText('Footer')).not.toBeInTheDocument();
    expect(screen.queryByText('Scripts')).not.toBeInTheDocument();
  });
});
