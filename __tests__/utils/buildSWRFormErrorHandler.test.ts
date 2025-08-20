import { describe, it, expect, vi } from 'vitest';
import { buildSWRFormErrorHandler } from '../../utils/buildSWRFormErrorHandler';

describe('buildSWRFormErrorHandler', () => {
  it('calls onUnauthorized for 401 and does not set error', () => {
    const setError = vi.fn();
    const onUnauthorized = vi.fn().mockReturnValue('handled');
    const messages = { unauthorized: 'unauth msg', notFound: 'notfound msg', default: 'default msg' };

    const handler = buildSWRFormErrorHandler({
      setError,
      field: 'myField',
      messages,
      onUnauthorized
    });

    const ret = handler({ status: 401 });

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledWith({ status: 401 });
    expect(setError).not.toHaveBeenCalled();
    expect(ret).toBe('handled');
  });

  it('sets unauthorized message for 401 when onUnauthorized is not provided', () => {
    const setError = vi.fn();
    const messages = { unauthorized: 'unauth msg', default: 'default msg' };

    const handler = buildSWRFormErrorHandler({
      setError,
      field: 'fieldA',
      messages
    });

    handler({ status: 401 });

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('fieldA', {
      type: 'manual',
      error: 'unauth msg'
    });
  });

  it('does nothing for 401 if unauthorized message is not provided and no onUnauthorized', () => {
    const setError = vi.fn();
    const messages = { default: 'default msg' };

    const handler = buildSWRFormErrorHandler({
      setError,
      field: 'fieldB',
      messages
    });

    handler({ status: 401 });

    expect(setError).not.toHaveBeenCalled();
  });

  it('sets notFound message for 404 when provided', () => {
    const setError = vi.fn();
    const messages = { notFound: 'notfound msg', default: 'default msg' };

    const handler = buildSWRFormErrorHandler({
      setError,
      field: 'fieldC',
      messages
    });

    handler({ status: 404 });

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('fieldC', {
      type: 'manual',
      error: 'notfound msg'
    });
  });

  it('falls back to default message for 404 when notFound message is missing', () => {
    const setError = vi.fn();
    const messages = { default: 'default msg' };

    const handler = buildSWRFormErrorHandler({
      setError,
      field: 'fieldD',
      messages
    });

    handler({ status: 404 });

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('fieldD', {
      type: 'manual',
      error: 'default msg'
    });
  });

  it('does nothing for status 200', () => {
    const setError = vi.fn();
    const messages = { default: 'default msg' };

    const handler = buildSWRFormErrorHandler({
      setError,
      field: 'fieldE',
      messages
    });

    handler({ status: 200 });

    expect(setError).not.toHaveBeenCalled();
  });

  it('uses default message for undefined status', () => {
    const setError = vi.fn();
    const messages = { default: 'default msg' };

    const handler = buildSWRFormErrorHandler({
      setError,
      field: 'fieldF',
      messages
    });

    handler({});

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('fieldF', {
      type: 'manual',
      error: 'default msg'
    });
  });

  it('uses default message for non-200 status (e.g., 500)', () => {
    const setError = vi.fn();
    const messages = { default: 'default msg' };

    const handler = buildSWRFormErrorHandler({
      setError,
      field: 'fieldG',
      messages
    });

    handler({ status: 500 });

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('fieldG', {
      type: 'manual',
      error: 'default msg'
    });
  });
});
