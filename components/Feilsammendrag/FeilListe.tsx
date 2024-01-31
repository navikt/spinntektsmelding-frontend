import { ErrorSummary } from '@navikt/ds-react';
import styles from './Feilsammendrag.module.css';

export interface Feilmelding {
  felt: string;
  text: string;
}

interface FeilListeProps {
  feilmeldinger: Feilmelding[];
  skalViseFeilmeldinger: boolean;
}

export default function FeilListe({ feilmeldinger, skalViseFeilmeldinger }: Readonly<FeilListeProps>) {
  const harFeilmeldinger = feilmeldinger && feilmeldinger.length > 0;
  if (!harFeilmeldinger) return null;

  return (
    <>
      {skalViseFeilmeldinger && harFeilmeldinger && (
        <ErrorSummary
          size='medium'
          heading='Du må rette disse feilene før du kan sende inn.'
          className={styles.mainwrapper}
        >
          {feilmeldinger?.map((melding) => (
            <ErrorSummary.Item key={melding.felt} href={`#${melding.felt}`}>
              {melding.text}
            </ErrorSummary.Item>
          ))}
        </ErrorSummary>
      )}
    </>
  );
}
