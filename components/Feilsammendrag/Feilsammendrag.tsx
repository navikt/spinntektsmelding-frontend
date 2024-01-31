import useBoundStore from '../../state/useBoundStore';
import FeilListe, { Feilmelding } from './FeilListe';

export default function Feilsammendrag() {
  const feilmeldinger = useBoundStore((state) => state.feilmeldinger);
  const skalViseFeilmeldinger = useBoundStore((state) => state.skalViseFeilmeldinger);
  const harFeilmeldinger = feilmeldinger && feilmeldinger.length > 0;
  if (!harFeilmeldinger) return null;

  return <FeilListe feilmeldinger={feilmeldinger as Feilmelding[]} skalViseFeilmeldinger={skalViseFeilmeldinger} />;
}
