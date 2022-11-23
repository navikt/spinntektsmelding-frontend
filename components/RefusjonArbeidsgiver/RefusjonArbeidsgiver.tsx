import { BodyLong, Radio, RadioGroup } from '@navikt/ds-react';
import Heading3 from '../Heading3';
import LabelLabel from '../LabelLabel';
import styles from '../../styles/Home.module.css';
import { YesNo } from '../../state/state';

import useBoundStore from '../../state/useBoundStore';
import RefsjonArbeidsgiverSluttdato from './RefsjonArbeidsgiverSluttdato';
import SelectBegrunnelse from './SelectBegrunnelse';
import RefusjonArbeidsgiverBelop from './RefusjonArbeidsgiverBelop';

export default function RefusjonArbeidsgiver() {
  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const grunnbeloep = useBoundStore((state) => state.grunnbeloep);

  const visFeilmeldingsTekst = useBoundStore((state) => state.visFeilmeldingsTekst);

  const arbeidsgiverBetalerFullLonnIArbeidsgiverperioden = useBoundStore(
    (state) => state.arbeidsgiverBetalerFullLonnIArbeidsgiverperioden
  );
  const arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret = useBoundStore(
    (state) => state.arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret
  );
  const begrunnelseRedusertUtbetaling = useBoundStore((state) => state.begrunnelseRedusertUtbetaling);
  const beloepArbeidsgiverBetalerISykefravaeret = useBoundStore(
    (state) => state.beloepArbeidsgiverBetalerISykefravaeret
  );
  const refusjonskravetOpphoererStatus = useBoundStore((state) => state.refusjonskravetOpphoererStatus);

  const bruttoinntektArbeidsforhold = (inntekt: number, seksG?: number): number => {
    if (seksG && (inntekt || 0 > seksG)) {
      return seksG;
    } else {
      return inntekt;
    }
  };

  const seksG = grunnbeloep?.grunnbeloepPerMaaned ? grunnbeloep?.grunnbeloepPerMaaned * 6 : undefined;

  return (
    <>
      <Heading3>Refusjon til arbeidsgiver</Heading3>
      <BodyLong>
        Vi må vite om arbeidsgiver betaler ut lønn under sykemeldingsperioden til arbeidstakeren, eller om NAV skal
        betale ut sykepenger til den sykemeldte etter arbeidsgiverperioden.
      </BodyLong>

      <div>
        <RadioGroup
          legend='Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?'
          className={styles.radiobuttonwrapper}
          id={'lia-radio'}
          error={visFeilmeldingsTekst('lia-radio')}
        >
          <Radio
            value='Ja'
            onClick={(event) => arbeidsgiverBetalerFullLonnIArbeidsgiverperioden(event.currentTarget.value as YesNo)}
            name='fullLonnIArbeidsgiverPerioden'
          >
            Ja
          </Radio>
          <Radio
            value='Nei'
            onClick={(event) => arbeidsgiverBetalerFullLonnIArbeidsgiverperioden(event.currentTarget.value as YesNo)}
            name='fullLonnIArbeidsgiverPerioden'
          >
            Nei
          </Radio>
        </RadioGroup>
        {fullLonnIArbeidsgiverPerioden?.status === 'Nei' && (
          <SelectBegrunnelse onChangeBegrunnelse={begrunnelseRedusertUtbetaling} />
        )}

        <RadioGroup
          legend='Betaler arbeidsgiver lønn etter arbeidsgiverperioden?'
          className={styles.radiobuttonwrapper}
          id={'lus-radio'}
          error={visFeilmeldingsTekst('lus-radio')}
        >
          <Radio
            value='Ja'
            onClick={(event) => arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret(event.currentTarget.value as YesNo)}
          >
            Ja
          </Radio>
          <Radio
            value='Nei'
            onClick={(event) => arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret(event.currentTarget.value as YesNo)}
          >
            Nei
          </Radio>
        </RadioGroup>
        {lonnISykefravaeret?.status === 'Ja' && (
          <>
            <RefusjonArbeidsgiverBelop
              bruttoinntekt={bruttoinntektArbeidsforhold(bruttoinntekt.bruttoInntekt, seksG)}
              onOppdaterBelop={beloepArbeidsgiverBetalerISykefravaeret}
              visFeilmeldingsTekst={visFeilmeldingsTekst}
            />

            <BodyLong className={styles.opphrefkravforklaring}>
              Refusjonsbeløpet som dere mottar fra NAV skal samsvare med lønnen dere betaler til arbeidstakeren under
              sykmeldingen (opp til 6 G). Refusjonsbeløpet gjelder fra den første dagen arbeidstakeren har rett til
              utbetaling fra NAV.
            </BodyLong>
            <RadioGroup
              legend='Opphører refusjonkravet i perioden?'
              className={styles.radiobuttonwrapper}
              id={'lus-sluttdato-velg'}
              error={visFeilmeldingsTekst('lus-sluttdato-velg')}
            >
              <Radio value='Ja' onClick={(event) => refusjonskravetOpphoererStatus(event.currentTarget.value as YesNo)}>
                Ja
              </Radio>
              <Radio
                value='Nei'
                onClick={(event) => refusjonskravetOpphoererStatus(event.currentTarget.value as YesNo)}
              >
                Nei
              </Radio>
            </RadioGroup>
            {refusjonskravetOpphoerer?.status && refusjonskravetOpphoerer?.status === 'Ja' && (
              <div className={styles.datepickerescape}>
                <RefsjonArbeidsgiverSluttdato />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
