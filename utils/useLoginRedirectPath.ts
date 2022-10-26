import { useRouter } from 'next/router';
import environment from '../config/environment';

function useLoginRedirectPath() {
  const router = useRouter();
  return () => {
    const currentRoute = `${router.basePath}${router.asPath}`;

    return environment.loginServiceUrl.replace('XXX', currentRoute);
  };
}

export default useLoginRedirectPath;
