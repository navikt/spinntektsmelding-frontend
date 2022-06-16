import { useRouter } from 'next/router';

export default function useRoute() {
  const router = useRouter();

  return (organisasjonsnummer?: string) => {
    if (organisasjonsnummer) {
      router.push(`?bedrift=${organisasjonsnummer}`);
    }
  };
}
