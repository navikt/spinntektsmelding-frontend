import Heading3 from '../Heading3';
import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import { TextField } from '@navikt/ds-react';

export default function Person() {
  const [
    navn,
    identitetsnummer,
    orgnrUnderenhet,
    virksomhetsnavn,
    innsenderTelefonNr,
    innsenderNavn,
    setInnsenderTelefon
  ] = useBoundStore(
    (state) => [
      state.navn,
      state.identitetsnummer,
      state.orgnrUnderenhet,
      state.virksomhetsnavn,
      state.innsenderTelefonNr,
      state.innsenderNavn,
      state.setInnsenderTelefon
    ],
    shallow
  );

  const changeTlfNr = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInnsenderTelefon(event.target.value);
  };

  return (
    <>
      <p>
        For at vi skal utbetale riktig beløp i forbindelse med sykmelding, må dere bekrefte eller oppdatere
        opplysningene vi har om den ansatte og sykefraværet.
      </p>
      <div className={lokalStyles.personinfowrapper}>
        <div className={lokalStyles.denansatte}>
          <Heading3>Den ansatte</Heading3>
          <div className={lokalStyles.ytreansattwrapper}>
            <div className={lokalStyles.ansattwrapper}>
              <TextLabel>Navn</TextLabel>
              <span data-cy='navn'>{navn}</span>
            </div>
            <div className={lokalStyles.ansattwrapper}>
              <TextLabel>Personnummer</TextLabel>
              <span data-cy='identitetsnummer'>{identitetsnummer}</span>
            </div>
          </div>
        </div>
        <div>
          <Heading3>Arbeidsgiveren</Heading3>
          <div className={lokalStyles.arbeidsgiverwrapper}>
            {virksomhetsnavn && (
              <div className={lokalStyles.virksomhetsnavnwrapper}>
                <TextLabel>Virksomhetsnavn</TextLabel>
                <div className={lokalStyles.virksomhetsnavn} data-cy='virksomhetsnavn'>
                  {virksomhetsnavn}
                </div>
              </div>
            )}
            <div className={lokalStyles.orgnrnavnwrapper}>
              <TextLabel>Org.nr. for underenhet</TextLabel>
              <span data-cy='orgnummer'>{orgnrUnderenhet}</span>
            </div>
            {!virksomhetsnavn && <div className={lokalStyles.virksomhetsnavnwrapper}></div>}
            {innsenderNavn && (
              <>
                <div className={lokalStyles.innsendernavnwrapper}>
                  <TextLabel>Innsender</TextLabel>
                  <div className={lokalStyles.virksomhetsnavn} data-cy='innsendernavn'>
                    {innsenderNavn}
                  </div>
                </div>
                <div className={lokalStyles.telefonnrwrapper}>
                  <TextField
                    label='Telefon innsender'
                    type='tel'
                    defaultValue={innsenderTelefonNr}
                    onChange={changeTlfNr}
                    data-cy='innsendertlf'
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
