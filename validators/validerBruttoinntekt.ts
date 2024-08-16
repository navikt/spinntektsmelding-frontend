import { isAfter } from 'date-fns';
import { periodeMapper } from '../components/Bruttoinntekt/Aarsaksvelger';
import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { CompleteState } from '../state/useBoundStore';
import parseIsoDate from '../utils/parseIsoDate';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import { ValiderResultat } from '../utils/validerInntektsmelding';
import validerPeriode from './validerPeriode';

export enum BruttoinntektFeilkode {
  BRUTTOINNTEKT_MANGLER = 'BRUTTOINNTEKT_MANGLER',
  INNTEKT_MANGLER = 'INNTEKT_MANGLER',
  ENDRINGSAARSAK_MANGLER = 'ENDRINGSAARSAK_MANGLER',
  IKKE_BEKREFTET = 'IKKE_BEKREFTET',
  SUM_LAVERE_ENN_INNTEKT = 'SUM_LAVERE_ENN_INNTEKT',
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

export default function validerBruttoinntekt(state: CompleteState): Array<ValiderResultat> {
  let valideringstatus: Array<ValiderResultat> = [];

  if (!state.bruttoinntekt) {
    valideringstatus = valideringstatus.filter((validering) => validering.felt !== 'bruttoinntekt');
    valideringstatus.push({
      felt: 'bruttoinntekt',
      code: BruttoinntektFeilkode.INNTEKT_MANGLER
    });
  } else {
    const bruttoinntekt = state.bruttoinntekt;
    if (ugyldigEllerNegativtTall(bruttoinntekt.bruttoInntekt)) {
      valideringstatus = valideringstatus.filter((validering) => validering.felt !== 'inntekt.beregnetInntekt');
      valideringstatus.push({
        felt: 'inntekt.beregnetInntekt',
        code: BruttoinntektFeilkode.BRUTTOINNTEKT_MANGLER
      });
    }

    if (bruttoinntekt.manueltKorrigert) {
      if (!bruttoinntekt.endringAarsak?.aarsak || bruttoinntekt.endringAarsak.aarsak === '') {
        valideringstatus.push({
          felt: 'bruttoinntekt-endringsaarsak',
          code: BruttoinntektFeilkode.ENDRINGSAARSAK_MANGLER
        });
      } else {
        const endringAarsak = bruttoinntekt.endringAarsak;
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
            if (!endringAarsak.perioder) {
              valideringstatus.push({
                felt: 'bruttoinntekt-endringsaarsak',
                code: BruttoinntektFeilkode.FERIE_MANGLER
              });
            } else {
              const feilkoder = validerPeriode(periodeMapper(endringAarsak.perioder), 'bruttoinntekt-ful');
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
              let gjelderFra: Date;

              if (typeof endringAarsak.gjelderFra === 'string') {
                gjelderFra = parseIsoDate(endringAarsak.gjelderFra);
              } else {
                gjelderFra = endringAarsak.gjelderFra;
              }

              if (state.bestemmendeFravaersdag && isAfter(gjelderFra, state.bestemmendeFravaersdag)) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-lonnsendring-fom',
                  code: BruttoinntektFeilkode.LONNSENDRING_FOM_ETTER_BFD
                });
              }
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.Permisjon: {
            if (!endringAarsak.perioder) {
              valideringstatus.push({
                felt: 'bruttoinntekt-permisjon-fom',
                code: BruttoinntektFeilkode.PERMISJON_MANGLER
              });
            } else {
              const feilkoder = validerPeriode(periodeMapper(endringAarsak.perioder), 'bruttoinntekt-permisjon');
              valideringstatus = valideringstatus.concat(feilkoder);
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.Permittering: {
            if (!endringAarsak.perioder) {
              valideringstatus.push({
                felt: 'bruttoinntekt-permittering-fom',
                code: BruttoinntektFeilkode.PERMITTERING_MANGLER
              });
            } else {
              const feilkoder = validerPeriode(periodeMapper(endringAarsak.perioder), 'bruttoinntekt-permittering');
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
            } else {
              if (
                state.bestemmendeFravaersdag &&
                parseIsoDate(endringAarsak.gjelderFra) > state.bestemmendeFravaersdag
              ) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-nystilling-fom',
                  code: BruttoinntektFeilkode.NYSTILLING_FOM_ETTER_BFD
                });
              }
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.NyStillingsprosent: {
            if (!endringAarsak.gjelderFra) {
              valideringstatus.push({
                felt: 'bruttoinntekt-nystillingsprosent-fom',
                code: BruttoinntektFeilkode.NYSTILLINGSPROSENT_FOM_MANGLER
              });
            } else {
              if (
                state.bestemmendeFravaersdag &&
                parseIsoDate(endringAarsak.gjelderFra) > state.bestemmendeFravaersdag
              ) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-nystillingsprosent-fom',
                  code: BruttoinntektFeilkode.NYSTILLINGSPROSENT_FOM_ETTER_BFD
                });
              }
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.Sykefravaer: {
            if (!endringAarsak.perioder) {
              valideringstatus.push({
                felt: 'bruttoinntekt-sykefravaerperioder',
                code: BruttoinntektFeilkode.SYKEFRAVAER_MANGLER
              });
            } else {
              const feilkoder = validerPeriode(
                periodeMapper(endringAarsak.perioder),
                'bruttoinntekt-sykefravaerperioder'
              );
              valideringstatus = valideringstatus.concat(feilkoder);
            }
            break;
          }
        }
      }
    }
  }

  return valideringstatus;
}
