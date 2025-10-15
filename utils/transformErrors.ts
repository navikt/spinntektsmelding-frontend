import { FieldErrors } from 'react-hook-form';
import z from 'zod';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';

type Hovedskjema = z.infer<typeof HovedskjemaSchema>;

function transformErrors(errors: FieldErrors<Hovedskjema>): FieldErrors<Hovedskjema> | undefined {
  const compositeErrors = Object.keys(errors)
    .filter((key) => /^\d+$/.test(key))
    .map((key) => (errors as any)[key]);

  const MAX_DEPTH = 50; // Prevent infinite recursion
  const visited = new WeakSet(); // Track visited objects to prevent circular references

  // Helper to check if property is writable
  const isWritable = (obj: any, prop: string | number): boolean => {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      return descriptor ? descriptor.writable !== false : true;
    } catch {
      return false;
    }
  };

  // Helper to safely set property
  const safeSet = (obj: any, key: string | number, value: any): boolean => {
    try {
      // Check if object is extensible
      if (!Object.isExtensible(obj)) {
        console.warn(`transformErrors: Object is not extensible, cannot set key "${key}"`);
        return false;
      }

      // Check if property is writable
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

  // Helper to safely delete property
  const safeDelete = (obj: any, key: string | number): boolean => {
    try {
      // Check if property is configurable
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
    // Guard against maximum recursion depth
    if (depth > MAX_DEPTH) {
      console.warn('transformErrors: Maximum recursion depth exceeded');
      return;
    }

    // Guard against null/undefined
    if (!node || typeof node !== 'object') {
      return;
    }

    // Guard against circular references
    if (visited.has(node)) {
      console.warn('transformErrors: Circular reference detected');
      return;
    }
    visited.add(node);

    // Guard against frozen objects
    if (Object.isFrozen(node)) {
      console.warn('transformErrors: Cannot modify frozen object');
      return;
    }

    // Handle root property
    if (Object.prototype.hasOwnProperty.call(node, 'root')) {
      if (parent !== undefined && key !== undefined) {
        safeSet(parent, key, compositeErrors);
      } else {
        // Clear existing keys safely
        Object.keys(node).forEach((k) => safeDelete(node, k));

        // Add composite errors safely
        compositeErrors.forEach((ce, idx) => {
          safeSet(node, idx, ce);
        });
      }
      return;
    }

    // Handle arrays
    if (Array.isArray(node)) {
      // Create a copy of indices to avoid mutation during iteration
      const indices = [...node.keys()];
      indices.forEach((idx) => traverse(node[idx], node, idx, depth + 1));
      return;
    }

    // Handle objects - use Object.keys to avoid issues with getters
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
    // Create a deep clone to avoid mutating the original if it's frozen/sealed
    let errorsCopy: any;
    try {
      errorsCopy = JSON.parse(JSON.stringify(errors));
    } catch {
      // If JSON.parse/stringify fails, work with original but be more careful
      console.warn('transformErrors: Could not clone errors, working with original');
      errorsCopy = errors;
    }

    traverse(errorsCopy);

    // Filter out numeric keys and empty strings
    const filteredErrorObject: Record<string, any> = {};
    Object.keys(errorsCopy)
      .filter((key) => key !== '' && !/^\d+$/.test(key))
      .forEach((key) => {
        filteredErrorObject[key] = errorsCopy[key];
      });

    return filteredErrorObject;
  } catch (error) {
    console.error('transformErrors: Error during traversal', error);
    return errors; // Return original errors on failure
  }
}

export default transformErrors;
