import React from 'react';
import { render } from '@testing-library/react';
import { FormProvider, useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';

/**
 * Renders children inside a react-hook-form FormProvider with sensible defaults.
 * Returns Testing Library utilities plus the RHF methods reference.
 *
 * Usage:
 *   const { methods } = renderWithRHF(<MyComponent />, { defaultValues: { foo: 'bar' }});
 *   fireEvent.change(screen.getByLabelText('Foo'), { target: { value: 'baz' }});
 *   await methods.trigger();
 */
export function renderWithRHF<TFieldValues extends Record<string, any> = Record<string, any>>(
  ui: React.ReactElement,
  formOptions: UseFormProps<TFieldValues> = {}
): ReturnType<typeof render> & { methods: UseFormReturn<TFieldValues> } {
  let methodsRef: UseFormReturn<TFieldValues> | undefined;
  function Wrapper() {
    const methods = useForm<TFieldValues>({ mode: 'onBlur', ...formOptions });
    methodsRef = methods;
    return <FormProvider {...methods}>{ui}</FormProvider>;
  }
  const utils = render(<Wrapper />);
  if (!methodsRef) throw new Error('methodsRef not set');
  return { ...utils, methods: methodsRef };
}

/** Convenience helper for quickly updating a field value and triggering validation */
export function setFieldValue<TFieldValues extends FieldValues>(
  methods: UseFormReturn<TFieldValues>,
  name: keyof TFieldValues & string,
  value: any
) {
  methods.setValue(name as any, value, { shouldDirty: true, shouldValidate: true });
}
