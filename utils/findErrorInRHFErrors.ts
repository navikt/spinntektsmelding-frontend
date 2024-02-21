import { FieldErrors, FieldValues } from 'react-hook-form';

export default function findErrorInRHFErrors(name: string, errors: FieldErrors<FieldValues>) {
  const errorKey = name.split('.');
  const error = errorKey.reduce((acc: FieldErrors<FieldValues> | undefined, key) => {
    if (acc?.[key]?.message) {
      return acc[key]?.message as string;
    } else {
      return acc?.[key];
    }
  }, errors);
  return error;
}
