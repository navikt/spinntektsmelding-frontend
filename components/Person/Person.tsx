import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import shallow from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import { Organisasjon } from '../Banner/Banner';

interface PersonProps {
  arbeidsgivere: Array<Organisasjon>;
}

export default function Person({ arbeidsgivere }: PersonProps) {
  const [navn, identitetsnummer, orgnrUnderenhet] = useBoundStore(
    (state) => [state.navn, state.identitetsnummer, state.orgnrUnderenhet],
    shallow
  );

  const virksomhet: Organisasjon | undefined = arbeidsgivere
    ? arbeidsgivere.find((arbeidsgiver) => arbeidsgiver.OrganizationNumber === orgnrUnderenhet)
    : undefined;

  const virksomhetsnavn = virksomhet ? virksomhet.Name : '';

  return (
    <>
      <p>
        For at vi skal utbetale riktig beløp i forbindelse med langvarig sykemelding må dere bekrefte, eller oppdatere
        opplysningene vi har i forbindelse med den ansatte, og sykefraværet.
      </p>
      <div className={lokalStyles.personinfowrapper}>
        <div className={lokalStyles.denansatte}>
          <Heading3>Den ansatte</Heading3>
          <div className={lokalStyles.ytreansattwrapper}>
            <div className={lokalStyles.ansattwrapper}>
              <TextLabel>Navn</TextLabel>
              {navn}
            </div>
            <div className={lokalStyles.ansattwrapper}>
              <TextLabel>Personnummer</TextLabel>
              {identitetsnummer}
            </div>
          </div>
        </div>
        <div>
          <Heading3>Arbeidsgiveren</Heading3>
          <div className={lokalStyles.arbeidsgiverwrapper}>
            <div className={lokalStyles.virksomhetsnavnwrapper}>
              <TextLabel>Virksomhetsnavn</TextLabel>
              <div className={lokalStyles.virksomhetsnavn}>{virksomhetsnavn}</div>
            </div>
            <div className={lokalStyles.orgnrnavnwrapper}>
              <TextLabel>Org.nr. for underenhet</TextLabel>
              {orgnrUnderenhet}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
