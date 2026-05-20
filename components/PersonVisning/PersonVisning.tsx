import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';

import lokalStyling from './Person.module.css';

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
}: Readonly<PersonProps>) {
  return (
    <div className={lokalStyling.personInfoWrapper}>
      <div className={lokalStyling.denAnsatte}>
        <Heading3>Den ansatte</Heading3>
        <div className={lokalStyling.ytreAnsattWrapper}>
          <div className={lokalStyling.ansattWrapper}>
            <TextLabel>Navn</TextLabel>
            <div data-cy='navn'>{navn}</div>
          </div>

          <div className={lokalStyling.ansattWrapper}>
            <TextLabel>Fødselsnummer</TextLabel>
            <div data-cy='identitetsnummer'>{identitetsnummer}</div>
          </div>
        </div>
      </div>
      <div>
        <Heading3>Arbeidsgiveren</Heading3>

        <div className={lokalStyling.arbeidsgiverWrapper}>
          <div className={lokalStyling.virksomhetsnavnWrapper}>
            <TextLabel>Virksomhetsnavn</TextLabel>
            <div className={lokalStyling.virksomhetNavn} data-cy='virksomhetNavn'>
              {virksomhetNavn}
            </div>
          </div>

          <div className={lokalStyling.orgnrNavnWrapper}>
            <TextLabel>Orgnr. for underenhet</TextLabel>
            <div data-cy='orgnummer'>{orgnrUnderenhet}</div>
          </div>
          <div className={lokalStyling.innsenderNavnWrapper}>
            <TextLabel>Innsender</TextLabel>
            <div className={lokalStyling.virksomhetNavn} data-cy='innsendernavn'>
              {innsenderNavn}
            </div>
          </div>
          <div className={lokalStyling.telefonWrapper}>
            <TextLabel>Telefon innsender</TextLabel>
            <div className={lokalStyling.virksomhetNavn}>{innsenderTelefonNr}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
