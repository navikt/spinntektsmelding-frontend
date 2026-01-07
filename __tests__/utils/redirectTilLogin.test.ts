import { describe, it, expect, vi } from 'vitest';
import { redirectTilLogin } from '../../utils/redirectTilLogin';

vi.mock('../config/environment', () => ({
  default: {
    baseUrl: '/spinntektsmelding'
  }
}));

describe('redirectTilLogin', () => {
  it('should return redirect object with correct destination', () => {
    const context = {
      req: {
        headers: {
          host: 'example.com'
        }
      },
      resolvedUrl: '/some-page'
    };

    const result = redirectTilLogin(context);

    expect(result).toEqual({
      redirect: {
        destination: 'https://example.com/im-dialog/oauth2/login?redirect=https://example.com/im-dialog/some-page',
        permanent: false
      }
    });
  });

  it('should handle resolvedUrl with query parameters', () => {
    const context = {
      req: {
        headers: {
          host: 'example.com'
        }
      },
      resolvedUrl: '/some-page?param=value'
    };

    const result = redirectTilLogin(context);

    expect(result.redirect.destination).toBe(
      'https://example.com/im-dialog/oauth2/login?redirect=https://example.com/im-dialog/some-page?param=value'
    );
    expect(result.redirect.permanent).toBe(false);
  });

  it('should handle root resolvedUrl', () => {
    const context = {
      req: {
        headers: {
          host: 'example.com'
        }
      },
      resolvedUrl: '/'
    };

    const result = redirectTilLogin(context);

    expect(result.redirect.destination).toBe(
      'https://example.com/im-dialog/oauth2/login?redirect=https://example.com/im-dialog/'
    );
  });
});
