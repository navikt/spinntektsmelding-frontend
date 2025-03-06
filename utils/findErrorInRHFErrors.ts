import { FieldErrors, FieldValues } from 'react-hook-form';

export default function findErrorInRHFErrors(name: string, errors: FieldErrors<FieldValues>) {
  const errorName = name.replace('[', '.').replace(']', '');

  const errorKey = errorName.split('.');
  const error = errorKey.reduce((acc: FieldErrors<FieldValues> | string | undefined, key: string) => {
    if (typeof acc !== 'string') {
      if (acc?.[key]?.message) {
        return acc[key]?.message as string;
      } else {
        return acc?.[key];
      }
    }
  }, errors);
  return error;
}
