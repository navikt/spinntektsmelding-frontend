import { BodyLong, Radio, RadioGroup } from '@navikt/ds-react';
import Heading3 from '../Heading3';
import LabelLabel from '../LabelLabel';
import styles from '../../styles/Home.module.css';
import { IArbeidsforhold, YesNo } from '../../state/state';
import Heading4 from '../Heading4';
import localStyles from './RefusjonArbeidsgiver.module.css';
import useBoundStore from '../../state/useBoundStore';
import RefsjonArbeidsgiverSluttdato from './RefsjonArbeidsgiverSluttdato';
import SelectBegrunnelse from './SelectBegrunnelse';
import RefusjonArbeidsgiverBelop from './RefusjonArbeidsgiverBelop';

export default function RefusjonArbeidsgiver() {
  const arbeidsforhold: Array<IArbeidsforhold> | undefined = useBoundStore((state) => state.arbeidsforhold);
  const aktiveArbeidsforhold = useBoundStore((state) => state.aktiveArbeidsforhold);

  const lonnISykefravaeret = useBoundStore((state) => state.lonnISykefravaeret);
  const fullLonnIArbeidsgiverPerioden = useBoundStore((state) => state.fullLonnIArbeidsgiverPerioden);
  const refusjonskravetOpphoerer = useBoundStore((state) => state.refusjonskravetOpphoerer);
  const bruttoinntekt = useBoundStore((state) => state.bruttoinntekt);
  const inntektsprosent = useBoundStore((state) => state.inntektsprosent);
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

  if (!arbeidsforhold) return null;

  const flereArbeidsforhold: boolean = arbeidsforhold.length > 1;

  const bruttoinntektArbeidsforhold = (inntekt: number, seksG?: number, inntektArbeidsforhold?: number): number => {
    if (seksG && (inntektArbeidsforhold || 0 > seksG)) {
      return seksG;
    }
    if (inntektArbeidsforhold) {
      return inntektArbeidsforhold;
    }

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
      {aktiveArbeidsforhold().map((forhold) => (
        <div key={forhold.arbeidsforholdId}>
          {flereArbeidsforhold && (
            <Heading4 className={localStyles.flerforholdheader}>Refusjon - {forhold.arbeidsforhold}</Heading4>
          )}
          <RadioGroup
            legend='Betaler arbeidsgiver ut full lønn til arbeidstaker i arbeidsgiverperioden?'
            className={styles.radiobuttonwrapper}
            id={`lia-radio-${forhold.arbeidsforholdId}`}
            error={visFeilmeldingsTekst(`lia-radio-${forhold.arbeidsforholdId}`)}
          >
            <Radio
              value='Ja'
              onClick={(event) =>
                arbeidsgiverBetalerFullLonnIArbeidsgiverperioden(
                  forhold.arbeidsforholdId,
                  event.currentTarget.value as YesNo
                )
              }
              name='fullLonnIArbeidsgiverPerioden'
            >
              Ja
            </Radio>
            <Radio
              value='Nei'
              onClick={(event) =>
                arbeidsgiverBetalerFullLonnIArbeidsgiverperioden(
                  forhold.arbeidsforholdId,
                  event.currentTarget.value as YesNo
                )
              }
              name='fullLonnIArbeidsgiverPerioden'
            >
              Nei
            </Radio>
          </RadioGroup>
          {fullLonnIArbeidsgiverPerioden?.[forhold.arbeidsforholdId]?.status === 'Nei' && (
            <SelectBegrunnelse
              onChangeBegrunnelse={begrunnelseRedusertUtbetaling}
              arbeidsforholdId={forhold.arbeidsforholdId}
            />
          )}

          <RadioGroup
            legend='Betaler arbeidsgiver lønn under hele eller deler av sykefraværet?'
            className={styles.radiobuttonwrapper}
            id={`lus-radio-${forhold.arbeidsforholdId}`}
            error={visFeilmeldingsTekst(`lus-radio-${forhold.arbeidsforholdId}`)}
          >
            <Radio
              value='Ja'
              onClick={(event) =>
                arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret(
                  forhold.arbeidsforholdId,
                  event.currentTarget.value as YesNo
                )
              }
            >
              Ja
            </Radio>
            <Radio
              value='Nei'
              onClick={(event) =>
                arbeidsgiverBetalerHeleEllerDelerAvSykefravaeret(
                  forhold.arbeidsforholdId,
                  event.currentTarget.value as YesNo
                )
              }
            >
              Nei
            </Radio>
          </RadioGroup>
          {lonnISykefravaeret?.[forhold.arbeidsforholdId]?.status === 'Ja' && (
            <>
              <RefusjonArbeidsgiverBelop
                bruttoinntekt={bruttoinntektArbeidsforhold(
                  bruttoinntekt.bruttoInntekt,
                  seksG,
                  inntektsprosent[forhold.arbeidsforholdId]
                )}
                arbeidsforholdId={forhold.arbeidsforholdId}
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
                id={`lus-sluttdato-velg-${forhold.arbeidsforholdId}`}
                error={visFeilmeldingsTekst(`lus-sluttdato-velg-${forhold.arbeidsforholdId}`)}
              >
                <Radio
                  value='Ja'
                  onClick={(event) =>
                    refusjonskravetOpphoererStatus(forhold.arbeidsforholdId, event.currentTarget.value as YesNo)
                  }
                >
                  Ja
                </Radio>
                <Radio
                  value='Nei'
                  onClick={(event) =>
                    refusjonskravetOpphoererStatus(forhold.arbeidsforholdId, event.currentTarget.value as YesNo)
                  }
                >
                  Nei
                </Radio>
              </RadioGroup>
              {refusjonskravetOpphoerer?.[forhold.arbeidsforholdId]?.status &&
                refusjonskravetOpphoerer?.[forhold.arbeidsforholdId]?.status === 'Ja' && (
                  <div className={styles.datepickerescape}>
                    <LabelLabel
                      htmlFor={`lus-sluttdato-${forhold.arbeidsforholdId}`}
                      className={styles.datepickerlabel}
                    >
                      Angi siste dag dere krever refusjon for
                    </LabelLabel>
                    <RefsjonArbeidsgiverSluttdato arbeidsforholdId={forhold.arbeidsforholdId} />
                  </div>
                )}
            </>
          )}
        </div>
      ))}
    </>
  );
}
