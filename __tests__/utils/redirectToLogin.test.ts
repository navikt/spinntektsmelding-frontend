import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { redirectToLogin } from '../../utils/redirectToLogin';
// import { redirectToLogin } from './redirectToLogin';
import environment from '../../config/environment';

describe('redirectToLogin', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Mock environment baseUrl
    environment.baseUrl = '/base';
    // Mock window.location
    delete (global as any).window;
    (global as any).window = {
      location: {
        hostname: 'example.com',
        replace: vi.fn()
      }
    };
  });

  afterEach(() => {
    // Restore original window
    delete (global as any).window;
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  it('redirects to login with default path', () => {
    redirectToLogin();
    const ingress = 'example.com/base';
    expect(window.location.replace).toHaveBeenCalledWith(
      `https://${ingress}/oauth2/login?redirect=${ingress}/initiering`
    );
  });

  it('redirects to login with custom path', () => {
    redirectToLogin('/custom');
    const ingress = 'example.com/base';
    expect(window.location.replace).toHaveBeenCalledWith(`https://${ingress}/oauth2/login?redirect=${ingress}/custom`);
  });

  it('does nothing when window is undefined', () => {
    delete (global as any).window;
    expect(() => redirectToLogin()).not.toThrow();
  });
});
