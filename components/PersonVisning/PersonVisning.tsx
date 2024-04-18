import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';

import lokalStyles from './Person.module.css';

interface PersonProps {
  navn: string;
  identitetsnummer: string;
  orgnrUnderenhet: string;
  virksomhetNavn: string;
  innsenderNavn: string;
  innsenderTelefonNr: string;
}

export default function PersonVisning({
  navn,
  identitetsnummer,
  orgnrUnderenhet,
  virksomhetNavn,
  innsenderNavn,
  innsenderTelefonNr
}: PersonProps) {
  return (
    <div className={lokalStyles.personInfoWrapper}>
      <div className={lokalStyles.denAnsatte}>
        <Heading3>Den ansatte</Heading3>
        <div className={lokalStyles.ytreAnsattWrapper}>
          <div className={lokalStyles.ansattWrapper}>
            <TextLabel>Navn</TextLabel>
            <div data-cy='navn'>{navn}</div>
          </div>

          <div className={lokalStyles.ansattWrapper}>
            <TextLabel>Personnummer</TextLabel>
            <div data-cy='identitetsnummer'>{identitetsnummer}</div>
          </div>
        </div>
      </div>
      <div>
        <Heading3>Arbeidsgiveren</Heading3>

        <div className={lokalStyles.arbeidsgiverWrapper}>
          <div className={lokalStyles.virksomhetsnavnWrapper}>
            <TextLabel>Virksomhetsnavn</TextLabel>
            <div className={lokalStyles.virksomhetNavn} data-cy='virksomhetNavn'>
              {virksomhetNavn}
            </div>
          </div>

          <div className={lokalStyles.orgnrNavnWrapper}>
            <TextLabel>Org.nr. for underenhet</TextLabel>
            <div data-cy='orgnummer'>{orgnrUnderenhet}</div>
          </div>
          <div className={lokalStyles.innsenderNavnWrapper}>
            <TextLabel>Innsender</TextLabel>
            <div className={lokalStyles.virksomhetNavn} data-cy='innsendernavn'>
              {innsenderNavn}
            </div>
          </div>
          <div className={lokalStyles.telefonWrapper}>
            <TextLabel>Telefon innsender</TextLabel>
            <div className={lokalStyles.virksomhetNavn} data-cy='innsendertlf'>
              {innsenderTelefonNr}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
