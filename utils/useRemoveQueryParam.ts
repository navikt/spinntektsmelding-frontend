import { useRouter } from 'next/router';
import { useCallback } from 'react';

export function useRemoveQueryParam() {
  const router = useRouter();

  return useCallback(
    (...params: string[]) => {
      const rest = { ...router.query };
      for (const param of params) {
        delete rest[param];
      }
      void router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    },
    [router]
  );
}
