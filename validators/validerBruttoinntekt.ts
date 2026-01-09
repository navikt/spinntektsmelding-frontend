import { isAfter } from 'date-fns';
import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { CompleteState } from '../state/useBoundStore';
import parseIsoDate from '../utils/parseIsoDate';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import { ValiderResultat } from '../utils/validerInntektsmelding';
import validerPeriode from './validerPeriode';
import { z } from 'zod';
import { HovedskjemaSchema } from '../schema/HovedskjemaSchema';
import { periodeMapper } from '../utils/periodeMapper';

export enum BruttoinntektFeilkode {
  BRUTTOINNTEKT_MANGLER = 'BRUTTOINNTEKT_MANGLER',
  INNTEKT_MANGLER = 'INNTEKT_MANGLER',
  ENDRINGSAARSAK_MANGLER = 'ENDRINGSAARSAK_MANGLER',
  TARIFFENDRING_FOM = 'TARIFFENDRING_FOM',
  TARIFFENDRING_KJENT = 'TARIFFENDRING_KJENT',
  FERIE_MANGLER = 'FERIE_MANGLER',
  LONNSENDRING_FOM_MANGLER = 'LONNSENDRING_FOM_MANGLER',
  LONNSENDRING_FOM_ETTER_BFD = 'LONNSENDRING_FOM_ETTER_BFD',
  PERMISJON_MANGLER = 'PERMISJON_MANGLER',
  PERMITTERING_MANGLER = 'PERMITTERING_MANGLER',
  NYSTILLING_FOM_MANGLER = 'NYSTILLING_FOM_MANGLER',
  NYSTILLING_FOM_ETTER_BFD = 'NYSTILLING_FOM_ETTER_BFD',
  NYSTILLINGSPROSENT_FOM_ETTER_BFD = 'NYSTILLINGSPROSENT_FOM_ETTER_BFD',
  NYSTILLINGSPROSENT_FOM_MANGLER = 'NYSTILLINGSPROSENT_FOM_MANGLER',
  SYKEFRAVAER_MANGLER = 'SYKEFRAVAER_MANGLER'
}

type Skjema = z.infer<typeof HovedskjemaSchema>;

export default function validerBruttoinntekt(
  state: CompleteState,
  skjemaData: Skjema,
  bestemmendeFravaersdag: Date
): Array<ValiderResultat> {
  let valideringStatus: Array<ValiderResultat> = [];

  if (!state.bruttoinntekt) {
    valideringStatus.push({
      felt: 'bruttoinntekt',
      code: BruttoinntektFeilkode.INNTEKT_MANGLER
    });
  } else {
    const bruttoinntekt = state.bruttoinntekt;
    if (ugyldigEllerNegativtTall(skjemaData.inntekt?.beloep)) {
      valideringStatus.push({
        felt: 'inntekt.beregnetInntekt',
        code: BruttoinntektFeilkode.BRUTTOINNTEKT_MANGLER
      });
    }

    if (bruttoinntekt.manueltKorrigert) {
      const endringAarsaker = skjemaData.inntekt?.endringAarsaker;
      endringAarsaker?.forEach((endringAarsak, index) => {
        if (!endringAarsak?.aarsak || (endringAarsak.aarsak as string) === '') {
          valideringStatus.push({
            felt: `bruttoinntekt-endringsaarsak-${index}`,
            code: BruttoinntektFeilkode.ENDRINGSAARSAK_MANGLER
          });
        } else {
          switch (endringAarsak?.aarsak) {
            case begrunnelseEndringBruttoinntekt.Tariffendring: {
              if (!endringAarsak.gjelderFra) {
                valideringStatus.push({
                  felt: 'bruttoinntekt-tariffendring-fom',
                  code: BruttoinntektFeilkode.TARIFFENDRING_FOM
                });
              }

              if (!endringAarsak.bleKjent) {
                valideringStatus.push({
                  felt: 'bruttoinntekt-tariffendring-kjent',
                  code: BruttoinntektFeilkode.TARIFFENDRING_KJENT
                });
              }
              break;
            }
            case begrunnelseEndringBruttoinntekt.Ferie: {
              if (endringAarsak.ferier) {
                const feilkoder = validerPeriode(periodeMapper(endringAarsak.ferier), 'bruttoinntekt-ful');
                valideringStatus = valideringStatus.concat(feilkoder);
              } else {
                valideringStatus.push({
                  felt: 'bruttoinntekt-endringsaarsak',
                  code: BruttoinntektFeilkode.FERIE_MANGLER
                });
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.VarigLoennsendring: {
              if (endringAarsak.gjelderFra) {
                const gjelderFra: Date = parseIsoDate(endringAarsak.gjelderFra)!;

                if (bestemmendeFravaersdag && isAfter(gjelderFra, bestemmendeFravaersdag)) {
                  valideringStatus.push({
                    felt: 'bruttoinntekt-lonnsendring-fom',
                    code: BruttoinntektFeilkode.LONNSENDRING_FOM_ETTER_BFD
                  });
                }
              } else {
                valideringStatus.push({
                  felt: 'bruttoinntekt-lonnsendring-fom',
                  code: BruttoinntektFeilkode.LONNSENDRING_FOM_MANGLER
                });
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.Permisjon: {
              if (endringAarsak.permisjoner) {
                const feilkoder = validerPeriode(periodeMapper(endringAarsak.permisjoner), 'bruttoinntekt-permisjon');
                valideringStatus = valideringStatus.concat(feilkoder);
              } else {
                valideringStatus.push({
                  felt: 'bruttoinntekt-permisjon-fom',
                  code: BruttoinntektFeilkode.PERMISJON_MANGLER
                });
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.Permittering: {
              if (endringAarsak.permitteringer) {
                const feilkoder = validerPeriode(
                  periodeMapper(endringAarsak.permitteringer),
                  'bruttoinntekt-permittering'
                );
                valideringStatus = valideringStatus.concat(feilkoder);
              } else {
                valideringStatus.push({
                  felt: 'bruttoinntekt-permittering-fom',
                  code: BruttoinntektFeilkode.PERMITTERING_MANGLER
                });
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.NyStilling: {
              if (endringAarsak.gjelderFra) {
                if (bestemmendeFravaersdag && parseIsoDate(endringAarsak.gjelderFra)! > bestemmendeFravaersdag) {
                  valideringStatus.push({
                    felt: 'bruttoinntekt-nystilling-fom',
                    code: BruttoinntektFeilkode.NYSTILLING_FOM_ETTER_BFD
                  });
                }
              } else {
                valideringStatus.push({
                  felt: 'bruttoinntekt-nystilling-fom',
                  code: BruttoinntektFeilkode.NYSTILLING_FOM_MANGLER
                });
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.NyStillingsprosent: {
              if (endringAarsak.gjelderFra) {
                if (bestemmendeFravaersdag && parseIsoDate(endringAarsak.gjelderFra)! > bestemmendeFravaersdag) {
                  valideringStatus.push({
                    felt: 'bruttoinntekt-nystillingsprosent-fom',
                    code: BruttoinntektFeilkode.NYSTILLINGSPROSENT_FOM_ETTER_BFD
                  });
                }
              } else {
                valideringStatus.push({
                  felt: 'bruttoinntekt-nystillingsprosent-fom',
                  code: BruttoinntektFeilkode.NYSTILLINGSPROSENT_FOM_MANGLER
                });
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.Sykefravaer: {
              if (endringAarsak.sykefravaer) {
                const feilkoder = validerPeriode(
                  periodeMapper(endringAarsak.sykefravaer),
                  'bruttoinntekt-sykefravaerperioder'
                );
                valideringStatus = valideringStatus.concat(feilkoder);
              } else {
                valideringStatus.push({
                  felt: 'bruttoinntekt-sykefravaerperioder',
                  code: BruttoinntektFeilkode.SYKEFRAVAER_MANGLER
                });
              }
              break;
            }
          }
        }
      });
    }
  }

  return valideringStatus;
}
