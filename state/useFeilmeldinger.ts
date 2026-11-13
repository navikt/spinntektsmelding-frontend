import { useShallow } from 'zustand/react/shallow';
import useBoundStore from './useBoundStore';

export default function useFeilmeldinger(prefix: string) {
  return useBoundStore(
    useShallow((state) => {
      const feilmeldinger: Record<string, string> = {};
      if (state.skalViseFeilmeldinger) {
        for (const melding of state.feilmeldinger) {
          if (melding.felt.startsWith(prefix) && !Object.hasOwn(feilmeldinger, melding.felt)) {
            feilmeldinger[melding.felt] = melding.text;
          }
        }
      }
      return feilmeldinger;
    })
  );
}
