import { isAfter } from 'date-fns';
import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { CompleteState } from '../state/useBoundStore';
import parseIsoDate from '../utils/parseIsoDate';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import { ValiderResultat } from '../utils/validerInntektsmelding';
import validerPeriode from './validerPeriode';
import { z } from 'zod/v4';
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
  let valideringstatus: Array<ValiderResultat> = [];

  if (!state.bruttoinntekt) {
    valideringstatus.push({
      felt: 'bruttoinntekt',
      code: BruttoinntektFeilkode.INNTEKT_MANGLER
    });
  } else {
    const bruttoinntekt = state.bruttoinntekt;
    if (ugyldigEllerNegativtTall(skjemaData.inntekt?.beloep)) {
      valideringstatus.push({
        felt: 'inntekt.beregnetInntekt',
        code: BruttoinntektFeilkode.BRUTTOINNTEKT_MANGLER
      });
    }

    if (bruttoinntekt.manueltKorrigert) {
      const endringAarsaker = skjemaData.inntekt?.endringAarsaker;
      endringAarsaker?.forEach((endringAarsak, index) => {
        if (!endringAarsak?.aarsak || endringAarsak.aarsak === '') {
          valideringstatus.push({
            felt: `bruttoinntekt-endringsaarsak-${index}`,
            code: BruttoinntektFeilkode.ENDRINGSAARSAK_MANGLER
          });
        } else {
          switch (endringAarsak?.aarsak) {
            case begrunnelseEndringBruttoinntekt.Tariffendring: {
              if (!endringAarsak.gjelderFra) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-tariffendring-fom',
                  code: BruttoinntektFeilkode.TARIFFENDRING_FOM
                });
              }

              if (!endringAarsak.bleKjent) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-tariffendring-kjent',
                  code: BruttoinntektFeilkode.TARIFFENDRING_KJENT
                });
              }
              break;
            }
            case begrunnelseEndringBruttoinntekt.Ferie: {
              if (!endringAarsak.ferier) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-endringsaarsak',
                  code: BruttoinntektFeilkode.FERIE_MANGLER
                });
              } else {
                const feilkoder = validerPeriode(periodeMapper(endringAarsak.ferier), 'bruttoinntekt-ful');
                valideringstatus = valideringstatus.concat(feilkoder);
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.VarigLoennsendring: {
              if (!endringAarsak.gjelderFra) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-lonnsendring-fom',
                  code: BruttoinntektFeilkode.LONNSENDRING_FOM_MANGLER
                });
              } else {
                const gjelderFra: Date = parseIsoDate(endringAarsak.gjelderFra)!;

                if (bestemmendeFravaersdag && isAfter(gjelderFra, bestemmendeFravaersdag)) {
                  valideringstatus.push({
                    felt: 'bruttoinntekt-lonnsendring-fom',
                    code: BruttoinntektFeilkode.LONNSENDRING_FOM_ETTER_BFD
                  });
                }
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.Permisjon: {
              if (!endringAarsak.permisjoner) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-permisjon-fom',
                  code: BruttoinntektFeilkode.PERMISJON_MANGLER
                });
              } else {
                const feilkoder = validerPeriode(periodeMapper(endringAarsak.permisjoner), 'bruttoinntekt-permisjon');
                valideringstatus = valideringstatus.concat(feilkoder);
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.Permittering: {
              if (!endringAarsak.permitteringer) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-permittering-fom',
                  code: BruttoinntektFeilkode.PERMITTERING_MANGLER
                });
              } else {
                const feilkoder = validerPeriode(
                  periodeMapper(endringAarsak.permitteringer),
                  'bruttoinntekt-permittering'
                );
                valideringstatus = valideringstatus.concat(feilkoder);
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.NyStilling: {
              if (!endringAarsak.gjelderFra) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-nystilling-fom',
                  code: BruttoinntektFeilkode.NYSTILLING_FOM_MANGLER
                });
              } else if (bestemmendeFravaersdag && parseIsoDate(endringAarsak.gjelderFra)! > bestemmendeFravaersdag) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-nystilling-fom',
                  code: BruttoinntektFeilkode.NYSTILLING_FOM_ETTER_BFD
                });
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.NyStillingsprosent: {
              if (!endringAarsak.gjelderFra) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-nystillingsprosent-fom',
                  code: BruttoinntektFeilkode.NYSTILLINGSPROSENT_FOM_MANGLER
                });
              } else if (bestemmendeFravaersdag && parseIsoDate(endringAarsak.gjelderFra)! > bestemmendeFravaersdag) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-nystillingsprosent-fom',
                  code: BruttoinntektFeilkode.NYSTILLINGSPROSENT_FOM_ETTER_BFD
                });
              }
              break;
            }

            case begrunnelseEndringBruttoinntekt.Sykefravaer: {
              if (!endringAarsak.sykefravaer) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-sykefravaerperioder',
                  code: BruttoinntektFeilkode.SYKEFRAVAER_MANGLER
                });
              } else {
                const feilkoder = validerPeriode(
                  periodeMapper(endringAarsak.sykefravaer),
                  'bruttoinntekt-sykefravaerperioder'
                );
                valideringstatus = valideringstatus.concat(feilkoder);
              }
              break;
            }
          }
        }
      });
    }
  }

  return valideringstatus;
}
