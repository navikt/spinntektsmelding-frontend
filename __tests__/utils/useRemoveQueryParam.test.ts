import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useRemoveQueryParam } from '../../utils/useRemoveQueryParam';

vi.mock('next/router', () => ({
  useRouter: vi.fn()
}));

describe('useRemoveQueryParam', () => {
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should remove a single query param', () => {
    vi.mocked(useRouter).mockReturnValue({
      query: { foo: 'bar', baz: 'qux' },
      pathname: '/test',
      replace: mockReplace
    } as any);

    const { result } = renderHook(() => useRemoveQueryParam());

    act(() => {
      result.current('foo');
    });

    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/test', query: { baz: 'qux' } }, undefined, {
      shallow: true
    });
  });

  it('should handle removing the only query param', () => {
    vi.mocked(useRouter).mockReturnValue({
      query: { foo: 'bar' },
      pathname: '/test',
      replace: mockReplace
    } as any);

    const { result } = renderHook(() => useRemoveQueryParam());

    act(() => {
      result.current('foo');
    });

    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/test', query: {} }, undefined, { shallow: true });
  });

  it('should handle removing a non-existent query param', () => {
    vi.mocked(useRouter).mockReturnValue({
      query: { foo: 'bar' },
      pathname: '/test',
      replace: mockReplace
    } as any);

    const { result } = renderHook(() => useRemoveQueryParam());

    act(() => {
      result.current('nonexistent');
    });

    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/test', query: { foo: 'bar' } }, undefined, {
      shallow: true
    });
  });

  it('should handle empty query object', () => {
    vi.mocked(useRouter).mockReturnValue({
      query: {},
      pathname: '/test',
      replace: mockReplace
    } as any);

    const { result } = renderHook(() => useRemoveQueryParam());

    act(() => {
      result.current('foo');
    });

    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/test', query: {} }, undefined, { shallow: true });
  });

  it('should preserve other query params when removing one', () => {
    vi.mocked(useRouter).mockReturnValue({
      query: { a: '1', b: '2', c: '3' },
      pathname: '/page',
      replace: mockReplace
    } as any);

    const { result } = renderHook(() => useRemoveQueryParam());

    act(() => {
      result.current('b');
    });

    expect(mockReplace).toHaveBeenCalledWith({ pathname: '/page', query: { a: '1', c: '3' } }, undefined, {
      shallow: true
    });
  });
});
