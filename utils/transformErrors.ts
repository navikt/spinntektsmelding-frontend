import { FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';

type Hovedskjema = z.infer<typeof HovedskjemaSchema>;

const MAX_DEPTH = 50;

function isNumericKey(key: string): boolean {
  return /^\d+$/.test(key);
}

function getCompositeErrors(errors: any): any[] {
  return Object.keys(errors)
    .filter(isNumericKey)
    .map((key) => errors[key]);
}

function isWritable(obj: any, prop: string | number): boolean {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    return descriptor ? descriptor.writable !== false : true;
  } catch {
    return false;
  }
}

function safeSet(obj: any, key: string | number, value: any): boolean {
  try {
    if (!Object.isExtensible(obj)) {
      console.warn(`transformErrors: Object is not extensible, cannot set key "${key}"`);
      return false;
    }

    if (Object.hasOwn(obj, key) && !isWritable(obj, key)) {
      console.warn(`transformErrors: Property "${key}" is read-only`);
      return false;
    }

    obj[key] = value;
    return true;
  } catch (error) {
    console.warn(`transformErrors: Failed to set property "${key}"`, error);
    return false;
  }
}

function safeDelete(obj: any, key: string | number): boolean {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor?.configurable === false) {
      console.warn(`transformErrors: Property "${key}" is not configurable, cannot delete`);
      return false;
    }

    delete obj[key];
    return true;
  } catch (error) {
    console.warn(`transformErrors: Failed to delete property "${key}"`, error);
    return false;
  }
}

function handleRootNode(node: any, parent: any, key: string | number | undefined, compositeErrors: any[]): void {
  if (parent !== undefined && key !== undefined) {
    safeSet(parent, key, compositeErrors);
    return;
  }

  // Root at top level - delete all keys and replace with array elements
  Object.keys(node).forEach((k) => safeDelete(node, k));
  compositeErrors.forEach((ce, idx) => safeSet(node, idx, ce));
}

function traverseArray(node: any[], visited: WeakSet<object>, compositeErrors: any[], depth: number): void {
  const indices = [...node.keys()];
  for (const idx of indices) {
    traverseNode(node[idx], node, idx, visited, compositeErrors, depth + 1);
  }
}

function traverseObject(node: any, visited: WeakSet<object>, compositeErrors: any[], depth: number): void {
  const keys = Object.keys(node);
  for (const k of keys) {
    try {
      traverseNode(node[k], node, k, visited, compositeErrors, depth + 1);
    } catch (error) {
      console.warn(`transformErrors: Error traversing key "${k}"`, error);
    }
  }
}

function traverseNode(
  node: any,
  parent?: any,
  key?: string | number,
  visited: WeakSet<object> = new WeakSet(),
  compositeErrors: any[] = [],
  depth: number = 0
): void {
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

  if (Object.hasOwn(node, 'root')) {
    handleRootNode(node, parent, key, compositeErrors);
    return;
  }

  if (Array.isArray(node)) {
    traverseArray(node, visited, compositeErrors, depth);
    return;
  }

  traverseObject(node, visited, compositeErrors, depth);
}

function cloneErrors(errors: any, visited = new WeakMap()): any {
  if (errors === null || typeof errors !== 'object') {
    return errors;
  }

  // Handle non-cloneable types (DOM elements, functions, etc.)
  if (errors instanceof Element || errors instanceof Node || typeof errors === 'function') {
    return errors;
  }

  // Handle circular references
  if (visited.has(errors)) {
    return visited.get(errors);
  }

  if (Array.isArray(errors)) {
    const arrCopy: any[] = [];
    visited.set(errors, arrCopy);
    for (let i = 0; i < errors.length; i++) {
      arrCopy[i] = cloneErrors(errors[i], visited);
    }
    return arrCopy;
  }

  const objCopy: Record<string, any> = {};
  visited.set(errors, objCopy);

  for (const key of Object.keys(errors)) {
    // Skip 'ref' property which often contains DOM elements
    if (key === 'ref') {
      objCopy[key] = errors[key];
    } else {
      objCopy[key] = cloneErrors(errors[key], visited);
    }
  }

  return objCopy;
}

function filterNumericKeys(obj: any): Record<string, any> {
  const filtered: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (key !== '' && !isNumericKey(key)) {
      filtered[key] = obj[key];
    }
  }
  return filtered;
}

function transformErrors(errors: FieldErrors<Hovedskjema>): FieldErrors<Hovedskjema> | undefined {
  if (!errors || Object.keys(errors).length === 0) {
    return {};
  }

  try {
    const compositeErrors = getCompositeErrors(errors);
    const errorsCopy = cloneErrors(errors);
    const visited = new WeakSet<object>();

    traverseNode(errorsCopy, undefined, undefined, visited, compositeErrors, 0);

    return filterNumericKeys(errorsCopy);
  } catch (error) {
    console.error('transformErrors: Error during traversal', error);
    return errors;
  }
}

export default transformErrors;
