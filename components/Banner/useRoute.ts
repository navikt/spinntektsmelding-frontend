import { useRouter } from 'next/router';

export default function useRoute() {
  const router = useRouter();

  return (organisasjonsnummer?: string, slug?: string) => {
    const sluggen = slug ? slug : '';
    if (organisasjonsnummer) {
      router.push(`${sluggen}?bedrift=${organisasjonsnummer}`);
    } else {
      router.push(sluggen);
    }
  };
}
