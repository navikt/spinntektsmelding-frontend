import { FieldErrors, FieldValues } from 'react-hook-form';

export default function findErrorInRHFErrors(name: string, errors: FieldErrors<FieldValues>) {
  const errorName = name.replace(/\[/g, '.').replace(/\]/g, '');

  const errorKey = errorName.split('.');
  const error = errorKey.reduce((acc: FieldErrors<FieldValues> | string | undefined, key: string) => {
    if (typeof acc !== 'string') {
      if (acc?.[key]?.error) {
        return acc[key]?.error as string;
      } else {
        return acc?.[key];
      }
    }
  }, errors);
  return error;
}
