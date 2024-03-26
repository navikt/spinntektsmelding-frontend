import { ValiderResultat } from '../utils/validerInntektsmelding';

export enum TelefonFeilkode {
  OK = 'OK',
  UGYLDIG_TELEFON = 'UGYLDIG_TELEFON',
  TELEFON_MANGLER = 'TELEFON_MANGLER'
}

export default function validerTelefon(telefon?: string): Array<ValiderResultat> {
  let feilkoder: Array<ValiderResultat> = [];

  if (!telefon) {
    feilkoder.push({
      felt: 'telefon',
      code: TelefonFeilkode.TELEFON_MANGLER
    });
  } else {
    const telefonRegex = /^(\+\d{10}|00\d{10}|\d{8})$/;
    const validTelefon = telefonRegex.test(telefon);

    if (!validTelefon) {
      feilkoder.push({
        felt: 'telefon',
        code: TelefonFeilkode.UGYLDIG_TELEFON
      });
    }
  }
  return feilkoder;
}
