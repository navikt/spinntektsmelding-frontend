import { Feilmelding } from '../components/Feilsammendrag/FeilListe';

export default function visFeilmeldingTekst(
  id: string,
  skalViseFeilmeldinger: boolean,
  feilmeldinger: Feilmelding[] | undefined
) {
  if (skalViseFeilmeldinger && feilmeldinger && feilmeldinger.length > 0) {
    const feilmelding = feilmeldinger.find((issue) => issue.felt === id);
    return feilmelding?.text ?? '';
  }
  return '';
}
