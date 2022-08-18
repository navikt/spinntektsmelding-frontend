import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import styles from '../../styles/Home.module.css';
import useBoundStore from '../../state/useBoundStore';
import shallow from 'zustand/shallow';

export default function Person() {
  const [navn, identitetsnummer, virksomhetsnavn, orgnrUnderenhet] = useBoundStore(
    (state) => [state.navn, state.identitetsnummer, state.virksomhetsnavn, state.orgnrUnderenhet],
    shallow
  );
  return (
    <>
      <p>
        For at vi skal utbetale riktig beløp i forbindelse med langvarig sykemelding må dere bekrefte, eller oppdatere
        opplysningene vi har i forbindelse med den ansatte, og sykefraværet.
      </p>
      <div className={styles.personinfowrapper}>
        <div className={styles.denansatte}>
          <Heading3>Den ansatte</Heading3>
          <div className={styles.arbeidsgiverwrapper}>
            <div className={styles.virksomhetsnavnwrapper}>
              <TextLabel>Navn</TextLabel>
              <div className={styles.virksomhetsnavn}>{navn}</div>
            </div>
            <div className={styles.orgnrnavnwrapper}>
              <TextLabel>Personnummer</TextLabel>
              <div className={styles.virksomhetsnavn}>{identitetsnummer}</div>
            </div>
          </div>
        </div>
        <div className={styles['size-resten']}>
          <Heading3>Arbeidsgiveren</Heading3>
          <div className={styles.arbeidsgiverwrapper}>
            <div className={styles.virksomhetsnavnwrapper}>
              <TextLabel>Virksomhetsnavn</TextLabel>
              <div className={styles.virksomhetsnavn}>{virksomhetsnavn}</div>
            </div>
            <div className={styles.orgnrnavnwrapper}>
              <TextLabel>Org.nr. for underenhet</TextLabel>
              <div className={styles.virksomhetsnavn}>{orgnrUnderenhet}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
