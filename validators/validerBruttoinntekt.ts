import begrunnelseEndringBruttoinntekt from '../components/Bruttoinntekt/begrunnelseEndringBruttoinntekt';
import { CompleteState } from '../state/useBoundStore';
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
      if (!bruttoinntekt.endringsaarsak || bruttoinntekt.endringsaarsak === '') {
        valideringstatus.push({
          felt: 'bruttoinntekt-endringsaarsak',
          code: BruttoinntektFeilkode.ENDRINGSAARSAK_MANGLER
        });
      } else {
        switch (bruttoinntekt.endringsaarsak) {
          case begrunnelseEndringBruttoinntekt.Tariffendring: {
            if (!state.tariffendringDato) {
              valideringstatus.push({
                felt: 'bruttoinntekt-tariffendring-fom',
                code: BruttoinntektFeilkode.TARIFFENDRING_FOM
              });
            }

            if (!state.tariffkjentdato) {
              valideringstatus.push({
                felt: 'bruttoinntekt-tariffendring-kjent',
                code: BruttoinntektFeilkode.TARIFFENDRING_KJENT
              });
            }
            break;
          }
          case begrunnelseEndringBruttoinntekt.Ferie: {
            if (!state.ferie) {
              valideringstatus.push({
                felt: 'bruttoinntekt-endringsaarsak',
                code: BruttoinntektFeilkode.FERIE_MANGLER
              });
            } else {
              const feilkoder = validerPeriode(state.ferie, 'bruttoinntekt-ful');
              valideringstatus = valideringstatus.concat(feilkoder);
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.VarigLoennsendring: {
            if (!state.lonnsendringsdato) {
              valideringstatus.push({
                felt: 'bruttoinntekt-lonnsendring-fom',
                code: BruttoinntektFeilkode.LONNSENDRING_FOM_MANGLER
              });
            } else {
              if (state.bestemmendeFravaersdag && state.lonnsendringsdato > state.bestemmendeFravaersdag) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-lonnsendring-fom',
                  code: BruttoinntektFeilkode.LONNSENDRING_FOM_ETTER_BFD
                });
              }
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.Permisjon: {
            if (!state.permisjon) {
              valideringstatus.push({
                felt: 'bruttoinntekt-permisjon-fom',
                code: BruttoinntektFeilkode.PERMISJON_MANGLER
              });
            } else {
              const feilkoder = validerPeriode(state.permisjon, 'bruttoinntekt-permisjon');
              valideringstatus = valideringstatus.concat(feilkoder);
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.Permittering: {
            if (!state.permittering) {
              valideringstatus.push({
                felt: 'bruttoinntekt-permittering-fom',
                code: BruttoinntektFeilkode.PERMITTERING_MANGLER
              });
            } else {
              const feilkoder = validerPeriode(state.permittering, 'bruttoinntekt-permittering');
              valideringstatus = valideringstatus.concat(feilkoder);
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.NyStilling: {
            if (!state.nystillingdato) {
              valideringstatus.push({
                felt: 'bruttoinntekt-nystilling-fom',
                code: BruttoinntektFeilkode.NYSTILLING_FOM_MANGLER
              });
            } else {
              if (state.bestemmendeFravaersdag && state.nystillingdato > state.bestemmendeFravaersdag) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-nystilling-fom',
                  code: BruttoinntektFeilkode.NYSTILLING_FOM_ETTER_BFD
                });
              }
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.NyStillingsprosent: {
            if (!state.nystillingsprosentdato) {
              valideringstatus.push({
                felt: 'bruttoinntekt-nystillingsprosent-fom',
                code: BruttoinntektFeilkode.NYSTILLINGSPROSENT_FOM_MANGLER
              });
            } else {
              if (state.bestemmendeFravaersdag && state.nystillingsprosentdato > state.bestemmendeFravaersdag) {
                valideringstatus.push({
                  felt: 'bruttoinntekt-nystillingsprosent-fom',
                  code: BruttoinntektFeilkode.NYSTILLINGSPROSENT_FOM_ETTER_BFD
                });
              }
            }
            break;
          }

          case begrunnelseEndringBruttoinntekt.Sykefravaer: {
            if (!state.sykefravaerperioder) {
              valideringstatus.push({
                felt: 'bruttoinntekt-sykefravaerperioder',
                code: BruttoinntektFeilkode.SYKEFRAVAER_MANGLER
              });
            } else {
              const feilkoder = validerPeriode(state.sykefravaerperioder, 'bruttoinntekt-sykefravaerperioder');
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
