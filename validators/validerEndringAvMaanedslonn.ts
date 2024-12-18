import { isAfter, isEqual } from 'date-fns';
import { EndringsBeloep } from '../components/RefusjonArbeidsgiver/RefusjonUtbetalingEndring';
import { LonnISykefravaeret, YesNo } from '../state/state';
import ugyldigEllerNegativtTall from '../utils/ugyldigEllerNegativtTall';
import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum EndringAvMaanedslonnFeilkode {
  MANGLER_BELOP = 'MANGLER_BELOP',
  MANGLER_DATO = 'MANGLER_DATO',
  MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN = 'MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN',
  DUPLISERT_VALG_ENDRING_MAANEDSLONN_I_PERIODEN = 'DUPLISERT_VALG_ENDRING_MAANEDSLONN_I_PERIODEN',
  DUPLISERT_DATO_VALG_ENDRING_MAANEDSLONN_I_PERIODEN = 'DUPLISERT_DATO_VALG_ENDRING_MAANEDSLONN_I_PERIODEN',
  BELOP_OVERSTIGER_BRUTTOINNTEKT = 'BELOP_OVERSTIGER_BRUTTOINNTEKT',
  ENDRING_DATO_ETTER_SLUTTDATO = 'ENDRING_DATO_ETTER_SLUTTDATO'
}

export default function valdiderEndringAvMaanedslonn(
  harRefusjonEndringer?: YesNo,
  refusjonEndringer?: Array<EndringsBeloep>,
  lonnISykefravaeret?: LonnISykefravaeret,
  bruttoInntekt?: number,
  sluttdato?: Date
): Array<ValiderResultat> {
  let feilmeldinger: Array<ValiderResultat> = [];
  const harLonnISykefravaeret = !!lonnISykefravaeret && lonnISykefravaeret.status === 'Ja';
  if (harLonnISykefravaeret && harRefusjonEndringer === undefined) {
    feilmeldinger.push({
      felt: 'refusjon.endringer',
      code: EndringAvMaanedslonnFeilkode.MANGLER_VALG_ENDRING_MAANEDSLONN_I_PERIODEN
    });
    return feilmeldinger;
  }
  if (harRefusjonEndringer === 'Ja' && refusjonEndringer) {
    const unikeEndringer: Array<EndringsBeloep> = refusjonEndringer
      .toSorted((a, b) => (a.dato > b.dato ? 1 : -1))
      .reduce((acc: Array<EndringsBeloep>, endring, index) => {
        if (index === 0) {
          acc.push(endring);
          return acc;
        }
        if (
          !isEqual(endring.dato as Date, acc[acc.length - 1].dato as Date) ||
          endring.beloep !== acc[acc.length - 1].beloep
        ) {
          acc.push(endring);
        }
        return acc;
      }, []);

    if (unikeEndringer.length !== refusjonEndringer.length) {
      feilmeldinger.push({
        felt: 'refusjon.endringer',
        code: EndringAvMaanedslonnFeilkode.DUPLISERT_VALG_ENDRING_MAANEDSLONN_I_PERIODEN
      });
    }

    const unikeEndringerDato: Array<EndringsBeloep> = unikeEndringer.reduce(
      (acc: Array<EndringsBeloep>, endring, index) => {
        if (index === 0) {
          acc.push(endring);
          return acc;
        }
        if (!isEqual(endring.dato as Date, acc[acc.length - 1].dato as Date)) {
          acc.push(endring);
        }
        return acc;
      },
      []
    );

    if (unikeEndringer.length !== unikeEndringerDato.length) {
      feilmeldinger.push({
        felt: 'refusjon.endringer',
        code: EndringAvMaanedslonnFeilkode.DUPLISERT_DATO_VALG_ENDRING_MAANEDSLONN_I_PERIODEN
      });
    }

    refusjonEndringer.forEach((endring, index) => {
      if (ugyldigEllerNegativtTall(endring.beloep)) {
        feilmeldinger.push({
          felt: `refusjon.refusjonEndringer[${index}].beløp`,
          code: EndringAvMaanedslonnFeilkode.MANGLER_BELOP
        });
      }
      if (endring.beloep && bruttoInntekt && endring.beloep > bruttoInntekt) {
        feilmeldinger.push({
          felt: `refusjon.refusjonEndringer[${index}].beløp`,
          code: EndringAvMaanedslonnFeilkode.BELOP_OVERSTIGER_BRUTTOINNTEKT
        });
      }

      if (!endring.dato) {
        feilmeldinger.push({
          felt: `refusjon.refusjonEndringer[${index}].dato`,
          code: EndringAvMaanedslonnFeilkode.MANGLER_DATO
        });
      }

      if (sluttdato && endring.dato && isAfter(endring.dato, sluttdato)) {
        feilmeldinger.push({
          felt: `refusjon.refusjonEndringer[${index}].dato`,
          code: EndringAvMaanedslonnFeilkode.ENDRING_DATO_ETTER_SLUTTDATO
        });
      }
    });
  }
  return feilmeldinger;
}
