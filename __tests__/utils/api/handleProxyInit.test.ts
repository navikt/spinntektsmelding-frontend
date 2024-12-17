import { describe, it, expect, vi } from 'vitest';
import handleProxyInit from '../../../utils/api/handleProxyInit';
// import handleProxyInit from './handleProxyInit';

describe('handleProxyInit', () => {
  it('should handle proxy error event', () => {
    const proxy = {
      on: vi.fn((event, callback) => {
        if (event === 'error') {
          const res = {
            writeHead: vi.fn(),
            end: vi.fn()
          };
          const err = new Error('Test error');
          callback(err, null, res);
          expect(res.writeHead).toHaveBeenCalledWith(500, { 'Content-Type': 'text/plain' });
          expect(res.end).toHaveBeenCalledWith('Something went wrong. ' + JSON.stringify(err));
        }
      })
    };

    handleProxyInit(proxy);
    expect(proxy.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should handle proxyReq event', () => {
    const proxy = {
      on: vi.fn((event, callback) => {
        if (event === 'proxyReq') {
          const proxyReq = {
            setHeader: vi.fn()
          };
          callback(proxyReq, null, null, null);
          expect(proxyReq.setHeader).toHaveBeenCalledWith('cookie', '');
        }
      })
    };

    handleProxyInit(proxy);
    expect(proxy.on).toHaveBeenCalledWith('proxyReq', expect.any(Function));
  });
});
