import { FieldErrors } from 'react-hook-form';
import z from 'zod';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';

type Hovedskjema = z.infer<typeof HovedskjemaSchema>;

function transformErrors(errors: FieldErrors<Hovedskjema>): FieldErrors<Hovedskjema> | undefined {
  const compositeErrors = Object.keys(errors)
    .filter((key) => /^\d+$/.test(key))
    .map((key) => (errors as any)[key]);

  const traverse = (node: any, parent?: any, key?: string | number) => {
    if (!node || typeof node !== 'object') return;

    if (Object.prototype.hasOwnProperty.call(node, 'root')) {
      if (parent !== undefined && key !== undefined) {
        parent[key] = compositeErrors;
      } else {
        Object.keys(node).forEach((k) => delete node[k]);
        compositeErrors.forEach((ce, idx) => {
          (node as any)[idx] = ce;
        });
      }
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((child, idx) => traverse(child, node, idx));
      return;
    }

    Object.keys(node).forEach((k) => traverse(node[k], node, k));
  };

  traverse(errors as any);

  let filteredErrorObject: Record<string, any> = {};
  Object.keys(errors)
    .filter((key) => key !== '' && !/^\d+$/.test(key))
    .forEach((key) => {
      filteredErrorObject = { ...filteredErrorObject, [key]: (errors as any)[key] };
    });

  return filteredErrorObject;
}

export default transformErrors;
