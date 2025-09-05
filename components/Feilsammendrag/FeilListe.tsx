import { ErrorSummary } from '@navikt/ds-react';
import styles from './Feilsammendrag.module.css';
import ensureValidHtmlId from '../../utils/ensureValidHtmlId';

export interface Feilmelding {
  felt: string;
  text: string;
}

interface FeilListeProps {
  feilmeldinger: Feilmelding[];
  skalViseFeilmeldinger: boolean;
}

export default function FeilListe({ feilmeldinger, skalViseFeilmeldinger }: Readonly<FeilListeProps>) {
  if (!feilmeldinger || feilmeldinger.length === 0) return null;
  if (Array.isArray(feilmeldinger) === false) return null;
  // Filtrer bort feilmeldinger hvor felt er tom streng eller starter med et tall
  const synligeFeilmeldinger = (feilmeldinger ?? []).filter(
    (f) => f.felt && f.felt.trim() !== '' && !/^\d/.test(f.felt)
  );
  const harSynligeFeilmeldinger = synligeFeilmeldinger.length > 0;
  if (!harSynligeFeilmeldinger) return null;

  return (
    <>
      {skalViseFeilmeldinger && harSynligeFeilmeldinger && (
        <ErrorSummary
          size='medium'
          heading='Du må rette disse feilene før du kan sende inn.'
          className={styles.mainwrapper}
        >
          {synligeFeilmeldinger.map((melding) => (
            <ErrorSummary.Item key={melding.felt} href={'#' + ensureValidHtmlId(`${melding.felt}`)}>
              {melding.text}
            </ErrorSummary.Item>
          ))}
        </ErrorSummary>
      )}
    </>
  );
}
