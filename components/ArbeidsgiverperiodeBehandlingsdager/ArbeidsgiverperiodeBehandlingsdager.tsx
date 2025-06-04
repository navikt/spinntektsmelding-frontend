import formatDate from '../../utils/formatDate';
import TextLabel from '../TextLabel';
import { BodyLong } from '@navikt/ds-react';
import useBoundStore from '../../state/useBoundStore';
import { Periode } from '../../state/state';
import Heading3 from '../Heading3';
import lokalStyles from './Arbeidsgiverperiode.module.css';
import Feilmelding from '../Feilmelding';
import LenkeEksternt from '../LenkeEksternt/LenkeEksternt';
import { SkjemaStatus } from '../../state/useSkjemadataStore';

interface ArbeidsgiverperiodeBehandlingsdagerProps {
  arbeidsgiverperioder: Array<Periode> | undefined;
  skjemastatus: SkjemaStatus;
  skalViseArbeidsgiverperiode: boolean;
}

export default function ArbeidsgiverperiodeBehandlingsdager({
  arbeidsgiverperioder,
  skjemastatus,
  skalViseArbeidsgiverperiode
}: Readonly<ArbeidsgiverperiodeBehandlingsdagerProps>) {
  const visFeilmeldingTekst = useBoundStore((state) => state.visFeilmeldingTekst);
  const visFeilmelding = useBoundStore((state) => state.visFeilmelding);

  return (
    <>
      <Heading3 unPadded id='arbeidsgiverperioder'>
        Arbeidsgiverperiode
      </Heading3>
      {!skalViseArbeidsgiverperiode && (
        <BodyLong>
          Vi har brukt egenmeldinger og sykmeldingsperiode til å foreslå en arbeidsgiverperiode. Hvis dette er feil må
          du endre perioden.{' '}
          <LenkeEksternt href='https://www.nav.no/arbeidsgiver/sykepenger-i-arbeidsgiverperioden#arbeidsgiverperioden'>
            Les mer om arbeidsgiverperiode og hvordan denne beregnes.
          </LenkeEksternt>
        </BodyLong>
      )}

      {arbeidsgiverperioder?.map((periode, periodeIndex) => (
        <div key={periode.id} className={lokalStyles.dateWrapper}>
          <div className={lokalStyles.endrearbeidsgiverperiode}>
            <div className={lokalStyles.datepickerEscape}>
              <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-fra`}>Fra</TextLabel>
              <div
                data-cy={`arbeidsgiverperiode-${periodeIndex}-fra-dato`}
                id={`arbeidsgiverperioder[${periodeIndex}].fom`}
              >
                {formatDate(periode.fom)}
              </div>
            </div>
            <div className={lokalStyles.datepickerEscape}>
              <TextLabel data-cy={`arbeidsgiverperiode-${periodeIndex}-til`}>Til</TextLabel>
              <div
                data-cy={`arbeidsgiverperiode-${periodeIndex}-til-dato`}
                id={`arbeidsgiverperioder[${periodeIndex}].tom`}
              >
                {formatDate(periode.tom)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {visFeilmelding('arbeidsgiverperioder-feil') && (
        <Feilmelding id='arbeidsgiverperioder-feil'>{visFeilmeldingTekst('arbeidsgiverperioder-feil')}</Feilmelding>
      )}
    </>
  );
}
