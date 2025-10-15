import { FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';

type Hovedskjema = z.infer<typeof HovedskjemaSchema>;

function transformErrors(errors: FieldErrors<Hovedskjema>): FieldErrors<Hovedskjema> | undefined {
  if (!errors || Object.keys(errors).length === 0) {
    return {};
  }

  const compositeErrors = Object.keys(errors)
    .filter((key) => /^\d+$/.test(key))
    .map((key) => (errors as any)[key]);

  const MAX_DEPTH = 50; // Prevent infinite recursion
  const visited = new WeakSet(); // Track visited objects to prevent circular references

  const isWritable = (obj: any, prop: string | number): boolean => {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      return descriptor ? descriptor.writable !== false : true;
    } catch {
      return false;
    }
  };

  const safeSet = (obj: any, key: string | number, value: any): boolean => {
    try {
      if (!Object.isExtensible(obj)) {
        console.warn(`transformErrors: Object is not extensible, cannot set key "${key}"`);
        return false;
      }

      if (Object.prototype.hasOwnProperty.call(obj, key) && !isWritable(obj, key)) {
        console.warn(`transformErrors: Property "${key}" is read-only`);
        return false;
      }

      obj[key] = value;
      return true;
    } catch (error) {
      console.warn(`transformErrors: Failed to set property "${key}"`, error);
      return false;
    }
  };

  const safeDelete = (obj: any, key: string | number): boolean => {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      if (descriptor && descriptor.configurable === false) {
        console.warn(`transformErrors: Property "${key}" is not configurable, cannot delete`);
        return false;
      }

      delete obj[key];
      return true;
    } catch (error) {
      console.warn(`transformErrors: Failed to delete property "${key}"`, error);
      return false;
    }
  };

  const traverse = (node: any, parent?: any, key?: string | number, depth: number = 0): void => {
    if (depth > MAX_DEPTH) {
      console.warn('transformErrors: Maximum recursion depth exceeded');
      return;
    }

    if (!node || typeof node !== 'object') {
      return;
    }

    if (visited.has(node)) {
      console.warn('transformErrors: Circular reference detected');
      return;
    }
    visited.add(node);

    if (Object.isFrozen(node)) {
      console.warn('transformErrors: Cannot modify frozen object');
      return;
    }

    if (Object.prototype.hasOwnProperty.call(node, 'root')) {
      if (parent !== undefined && key !== undefined) {
        safeSet(parent, key, compositeErrors);
      } else {
        Object.keys(node).forEach((k) => safeDelete(node, k));

        compositeErrors.forEach((ce, idx) => {
          safeSet(node, idx, ce);
        });
      }
      return;
    }

    if (Array.isArray(node)) {
      const indices = [...node.keys()];
      indices.forEach((idx) => traverse(node[idx], node, idx, depth + 1));
      return;
    }

    const keys = Object.keys(node);
    keys.forEach((k) => {
      try {
        traverse(node[k], node, k, depth + 1);
      } catch (error) {
        console.warn(`transformErrors: Error traversing key "${k}"`, error);
      }
    });
  };

  try {
    let errorsCopy: any;
    try {
      errorsCopy = JSON.parse(JSON.stringify(errors));
    } catch {
      console.warn('transformErrors: Could not clone errors, working with original');
      errorsCopy = errors;
    }

    traverse(errorsCopy);

    const filteredErrorObject: Record<string, any> = {};
    Object.keys(errorsCopy)
      .filter((key) => key !== '' && !/^\d+$/.test(key))
      .forEach((key) => {
        filteredErrorObject[key] = errorsCopy[key];
      });

    return filteredErrorObject;
  } catch (error) {
    console.error('transformErrors: Error during traversal', error);
    return errors;
  }
}

export default transformErrors;
