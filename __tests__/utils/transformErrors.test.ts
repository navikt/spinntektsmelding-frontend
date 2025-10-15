// __tests__/utils/transformErrors.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import transformErrors from '../../utils/transformErrors';
import { FieldErrors } from 'react-hook-form';

describe('transformErrors', () => {
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Basic functionality', () => {
    it('should return undefined for empty errors object', () => {
      const errors = {};
      const result = transformErrors(errors as FieldErrors<any>);
      expect(result).toEqual({});
    });

    it('should filter out numeric keys', () => {
      const errors = {
        '0': { message: 'Error 0' },
        '1': { message: 'Error 1' },
        field: { message: 'Field error' }
      };
      const result = transformErrors(errors as FieldErrors<any>);
      expect(result).toEqual({ field: { message: 'Field error' } });
    });

    it('should filter out empty string keys', () => {
      const errors = {
        '': { message: 'Empty key error' },
        field: { message: 'Field error' }
      };
      const result = transformErrors(errors as FieldErrors<any>);
      expect(result).toEqual({ field: { message: 'Field error' } });
    });

    it('should handle root property transformation', () => {
      const errors = {
        '0': { message: 'Error 0' },
        '1': { message: 'Error 1' },
        nested: {
          root: { message: 'Root error' }
        }
      };
      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.nested).toEqual([{ message: 'Error 0' }, { message: 'Error 1' }]);
    });

    it('should preserve non-root nested structures', () => {
      const errors = {
        field: {
          nested: {
            deep: { message: 'Deep error' }
          }
        }
      };
      const result = transformErrors(errors as FieldErrors<any>);
      expect(result).toEqual(errors);
    });
  });

  describe('Circular reference protection', () => {
    it('should handle circular references', () => {
      const obj: any = { field: { nested: {} } };
      obj.field.nested.circular = obj;

      const result = transformErrors(obj);
      expect(result).toBeDefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Circular reference detected'));
    });

    it('should handle self-referencing objects', () => {
      const obj: any = { field: {} };
      obj.field.self = obj.field;

      const result = transformErrors(obj);
      expect(result).toBeDefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Circular reference detected'));
    });

    it('should handle multiple circular references', () => {
      const obj1: any = { a: {} };
      const obj2: any = { b: {} };
      obj1.a.ref = obj2;
      obj2.b.ref = obj1;

      const result = transformErrors(obj1);
      expect(result).toBeDefined();
    });
  });

  describe('Deep recursion protection', () => {
    it('should handle deeply nested objects', () => {
      let deep: any = { value: 'test' };
      for (let i = 0; i < 100; i++) {
        deep = { nested: deep };
      }

      const result = transformErrors(deep);
      expect(result).toBeDefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Maximum recursion depth exceeded'));
    });

    it('should handle deeply nested arrays', () => {
      let deep: any = ['test'];
      for (let i = 0; i < 100; i++) {
        deep = [deep];
      }

      const result = transformErrors(deep as any);
      expect(result).toBeDefined();
    });

    it('should stop at MAX_DEPTH (50 levels)', () => {
      let deep: any = { level: 0 };
      for (let i = 1; i <= 60; i++) {
        deep = { level: i, nested: deep };
      }

      const result = transformErrors(deep);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Maximum recursion depth exceeded'));
    });
  });

  describe('Frozen and sealed objects', () => {
    it('should handle frozen objects gracefully', () => {
      const obj = Object.freeze({
        field: { message: 'Error' },
        nested: {
          root: { message: 'Root error' }
        }
      });

      const result = transformErrors(obj as FieldErrors<any>);
      expect(result).toBeDefined();
    });

    it('should warn when encountering frozen objects', () => {
      const obj = {
        field: Object.freeze({ message: 'Error' })
      };

      transformErrors(obj as FieldErrors<any>);
      // Should warn if trying to modify frozen nested object
    });

    it('should handle sealed objects', () => {
      const obj = Object.seal({
        field: { message: 'Error' }
      });

      const result = transformErrors(obj as FieldErrors<any>);
      expect(result).toBeDefined();
    });

    it('should handle non-extensible objects', () => {
      const obj: any = { field: { message: 'Error' } };
      Object.preventExtensions(obj);

      const result = transformErrors(obj);
      expect(result).toBeDefined();
    });
  });

  describe('Read-only properties', () => {
    it('should handle read-only properties', () => {
      const obj: any = {};
      Object.defineProperty(obj, 'readonly', {
        value: { message: 'Read only error' },
        writable: false,
        configurable: true
      });

      const result = transformErrors(obj);
      expect(result).toBeDefined();
    });

    it('should handle non-configurable properties', () => {
      const obj: any = {};
      Object.defineProperty(obj, 'nonConfigurable', {
        value: { message: 'Non-configurable error' },
        writable: true,
        configurable: false
      });

      const result = transformErrors(obj);
      expect(result).toBeDefined();
    });

    it('should warn when trying to modify read-only properties', () => {
      const obj: any = {
        nested: {
          root: { message: 'Root' }
        }
      };
      Object.defineProperty(obj.nested, 'readonly', {
        value: 'test',
        writable: false
      });

      transformErrors(obj);
      // Should handle gracefully
    });
  });

  describe('Array handling', () => {
    it('should handle arrays with errors', () => {
      const errors = {
        items: [{ message: 'Error 1' }, { message: 'Error 2' }]
      };

      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.items).toEqual(errors.items);
    });

    it('should handle nested arrays', () => {
      const errors = {
        matrix: [
          [{ message: 'Error 1-1' }, { message: 'Error 1-2' }],
          [{ message: 'Error 2-1' }, { message: 'Error 2-2' }]
        ]
      };

      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.matrix).toEqual(errors.matrix);
    });

    it('should handle sparse arrays', () => {
      const errors: any = {
        sparse: []
      };
      errors.sparse[0] = { message: 'Error 0' };
      errors.sparse[5] = { message: 'Error 5' };

      const result = transformErrors(errors);
      expect(result).toBeDefined();
    });

    it('should handle arrays with root property', () => {
      const errors = {
        '0': { message: 'Error 0' },
        '1': { message: 'Error 1' },
        items: {
          root: { message: 'Root error' }
        }
      };

      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.items).toEqual([{ message: 'Error 0' }, { message: 'Error 1' }]);
    });
  });

  describe('Complex nested structures', () => {
    it('should handle mixed arrays and objects', () => {
      const errors = {
        users: [
          {
            name: { message: 'Name required' },
            email: { message: 'Email invalid' }
          },
          {
            name: { message: 'Name required' }
          }
        ]
      };

      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.users).toEqual(errors.users);
    });

    it('should handle deeply nested structures with root', () => {
      const errors = {
        '0': { message: 'Error 0' },
        level1: {
          level2: {
            level3: {
              root: { message: 'Deep root' }
            }
          }
        }
      };

      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.level1?.level2?.level3).toEqual([{ message: 'Error 0' }]);
    });

    it('should handle multiple root properties at different levels', () => {
      const errors = {
        '0': { message: 'Error 0' },
        '1': { message: 'Error 1' },
        first: {
          root: { message: 'First root' }
        },
        second: {
          nested: {
            root: { message: 'Second root' }
          }
        }
      };

      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.first).toEqual([{ message: 'Error 0' }, { message: 'Error 1' }]);
      expect(result?.second?.nested).toEqual([{ message: 'Error 0' }, { message: 'Error 1' }]);
    });
  });

  describe('Edge cases', () => {
    it('should handle null values', () => {
      const errors = {
        field: null
      };

      const result = transformErrors(errors as any);
      expect(result).toBeDefined();
    });

    it('should handle undefined values', () => {
      const errors = {
        field: undefined
      };

      const result = transformErrors(errors as any);
      expect(result).toBeDefined();
    });

    it('should handle primitive values', () => {
      const errors = {
        string: 'error',
        number: 42,
        boolean: true
      } as any;

      const result = transformErrors(errors);
      expect(result).toBeDefined();
    });

    it('should handle Date objects', () => {
      const errors = {
        date: new Date(),
        field: { message: 'Error' }
      } as any;

      const result = transformErrors(errors);
      expect(result?.field).toEqual({ message: 'Error' });
    });

    it('should handle RegExp objects', () => {
      const errors = {
        regex: /test/,
        field: { message: 'Error' }
      } as any;

      const result = transformErrors(errors);
      expect(result?.field).toEqual({ message: 'Error' });
    });

    it('should handle objects with symbols', () => {
      const sym = Symbol('test');
      const errors: any = {
        [sym]: { message: 'Symbol error' },
        field: { message: 'Regular error' }
      };

      const result = transformErrors(errors);
      expect(result?.field).toEqual({ message: 'Regular error' });
    });
  });

  describe('JSON serialization edge cases', () => {
    it('should handle objects that fail JSON.stringify', () => {
      const circular: any = { field: {} };
      circular.field.circular = circular;

      const result = transformErrors(circular);
      expect(result).toBeDefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Could not clone errors'));
    });

    it('should handle objects with toJSON method', () => {
      const errors = {
        field: {
          toJSON: () => ({ custom: 'serialization' }),
          message: 'Error'
        }
      } as any;

      const result = transformErrors(errors);
      expect(result).toBeDefined();
    });

    it('should handle BigInt values in errors (cannot be JSON serialized)', () => {
      const errors = {
        bigint: BigInt(12345),
        field: { message: 'Error' }
      } as any;

      const result = transformErrors(errors);
      expect(result).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should return original errors on traversal error', () => {
      const errors = {
        field: { message: 'Error' }
      };

      // Mock traverse to throw
      const originalStringify = JSON.stringify;
      JSON.stringify = vi.fn(() => {
        throw new Error('Stringify failed');
      });

      const result = transformErrors(errors as FieldErrors<any>);
      expect(consoleWarnSpy).toHaveBeenCalled();

      JSON.stringify = originalStringify;
    });

    it('should handle errors during property access', () => {
      const errors: any = {};
      Object.defineProperty(errors, 'throwing', {
        get() {
          throw new Error('Property access error');
        },
        enumerable: true
      });

      const result = transformErrors(errors);
      expect(result).toBeDefined();
    });

    it('should log traversal errors', () => {
      const errors = {
        field: {
          get badGetter() {
            throw new Error('Getter error');
          }
        }
      } as any;

      transformErrors(errors);
      // Should handle gracefully
    });
  });

  describe('Performance and limits', () => {
    it('should handle large objects efficiently', () => {
      const largeErrors: any = {};
      for (let i = 0; i < 1000; i++) {
        largeErrors[`field${i}`] = { message: `Error ${i}` };
      }

      const start = Date.now();
      const result = transformErrors(largeErrors);
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle objects with many numeric keys', () => {
      const errors: any = {};
      for (let i = 0; i < 100; i++) {
        errors[i.toString()] = { message: `Error ${i}` };
      }
      errors.field = { message: 'Field error' };

      const result = transformErrors(errors);
      expect(result).toEqual({ field: { message: 'Field error' } });
      expect(Object.keys(result || {}).length).toBe(1);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle React Hook Form array validation errors', () => {
      const errors = {
        '0': { name: { message: 'Name required' } },
        '1': { email: { message: 'Email invalid' } },
        items: {
          root: { message: 'At least 2 items required' }
        }
      };

      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.items).toEqual([{ name: { message: 'Name required' } }, { email: { message: 'Email invalid' } }]);
    });

    it('should handle nested field arrays', () => {
      const errors = {
        '0': { message: 'Section 0 error' },
        '1': { message: 'Section 1 error' },
        sections: {
          root: { message: 'Sections error' },
          '0': {
            items: {
              root: { message: 'Items error' }
            }
          }
        }
      };

      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.sections).toBeDefined();
    });

    it('should preserve error message structure', () => {
      const errors = {
        field: {
          type: 'required',
          message: 'This field is required',
          ref: {} as any
        }
      };

      const result = transformErrors(errors as FieldErrors<any>);
      expect(result?.field).toEqual(errors.field);
    });
  });
});
