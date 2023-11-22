import { useRouter } from 'next/navigation';

export default function useRoute() {
  const router = useRouter();

  return (organisasjonsnummer?: string, slug?: string) => {
    const sluggen = slug ? slug : '';
    if (!slug) return;
    if (organisasjonsnummer) {
      router.push(`${sluggen}?bedrift=${organisasjonsnummer}`);
    } else {
      router.push(sluggen);
    }
  };
}
