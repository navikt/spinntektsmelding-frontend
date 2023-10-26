import { useRouter } from 'next/router';

export default function useRoute() {
  const router = useRouter();

  return async (organisasjonsnummer?: string, slug?: string) => {
    const sluggen = slug ? slug : '';
    if (!slug) return;
    if (organisasjonsnummer) {
      await router.push(`${sluggen}?bedrift=${organisasjonsnummer}`);
    } else {
      await router.push(sluggen);
    }
  };
}
