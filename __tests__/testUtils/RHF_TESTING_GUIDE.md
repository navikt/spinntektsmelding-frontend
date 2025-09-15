## RHF Testing Helper

Use `renderWithRHF` from `__tests__/testUtils/renderWithRHF` for components that rely on `useFormContext` / `FormProvider`.

Example:

```tsx
import { screen } from '@testing-library/react';
import { renderWithRHF } from '../testUtils/renderWithRHF';
import MyComponent from '../../components/MyComponent';

test('shows validation error', async () => {
  const { methods } = renderWithRHF(<MyComponent />, { defaultValues: { foo: '' } });
  methods.setError('foo' as any, { type: 'manual', message: 'Feil' });
  expect(await screen.findByText('Feil')).toBeInTheDocument();
});
```

Prefer this over ad-hoc `FormProvider` wrappers or deep mocking of `react-hook-form` internals.

If you need custom form options (e.g. `mode: 'onSubmit'`), pass them via the second argument.

Skip refactor for tests that intentionally mock to simulate edge RHF states that are hard to reproduce (document with a comment).
