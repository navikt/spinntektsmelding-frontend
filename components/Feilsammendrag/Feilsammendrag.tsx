import { ErrorSummary } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import styles from './Feilsammendrag.module.css';

export default function Feilsammendrag() {
  const feilmeldinger = useBoundStore((state) => state.feilmeldinger);
  const skalViseFeilmeldinger = useBoundStore((state) => state.skalViseFeilmeldinger);

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
