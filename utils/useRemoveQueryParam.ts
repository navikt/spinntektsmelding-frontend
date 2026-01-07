import { useRouter } from 'next/router';
import { useCallback } from 'react';

export function useRemoveQueryParam() {
  const router = useRouter();

  return useCallback(
    (param: string) => {
      const { [param]: _, ...rest } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    },
    [router]
  );
}
