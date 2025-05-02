import { Skeleton } from '@navikt/ds-react/Skeleton';

interface SkeletonLoaderProps {
  ferdigLastet: boolean;
  tekst?: string;
}

export function SkeletonLoader({ ferdigLastet, tekst }: SkeletonLoaderProps) {
  return ferdigLastet ? tekst : <Skeleton variant='text' width='90%' height={28} />;
}
