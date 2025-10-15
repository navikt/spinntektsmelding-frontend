import { describe, it, expect, vi } from 'vitest';
import transformErrors from '../../utils/transformErrors';
// import transformErrors from './transformErrors';

// Mock schema import used only for types
vi.mock('../schema/HovedskjemaSchema', () => ({ HovedskjemaSchema: {} as any }));

describe('transformErrors', () => {
  it('replaces nested "root" with composite errors and filters numeric keys', () => {
    const errors: any = {
      '0': { message: 'err0' },
      '1': { message: 'err1' },
      name: { type: 'required', message: 'Name required' },
      details: { root: { type: 'nested-root' }, other: 'x' }
    };

    const result = transformErrors(errors as any);

    expect(result).toEqual({
      name: { type: 'required', message: 'Name required' },
      details: [{ message: 'err0' }, { message: 'err1' }]
    });
  });

  it('handles top-level "root" by replacing entire object with composite errors and returning empty object', () => {
    const errors: any = {
      '0': { message: 'err0' },
      '1': { message: 'err1' },
      root: { type: 'root-err' },
      '': { message: 'ignored' },
      foo: { message: 'will be removed due to top-level root' }
    };

    const result = transformErrors(errors as any);

    expect(result).toEqual({});
  });

  it('replaces "root" inside array element with composite errors', () => {
    const errors: any = {
      '0': { message: 'err0' },
      list: [{ a: 1 }, { root: { message: 'bad' } }, { b: 2 }],
      other: { c: 3 }
    };

    const result = transformErrors(errors as any);

    expect(result).toEqual({
      list: [{ a: 1 }, [{ message: 'err0' }], { b: 2 }],
      other: { c: 3 }
    });
  });

  it('uses empty array when no composite numeric keys exist', () => {
    const errors: any = {
      info: { root: { anything: true } },
      something: 1
    };

    const result = transformErrors(errors as any);

    expect(result).toEqual({
      info: [],
      something: 1
    });
  });

  it('filters out numeric keys when no "root" is present', () => {
    const errors: any = {
      '0': { message: 'err0' },
      person: { name: { message: 'missing' } }
    };

    const result = transformErrors(errors as any);

    expect(result).toEqual({
      person: { name: { message: 'missing' } }
    });
  });
});
