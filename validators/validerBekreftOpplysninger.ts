import { ValiderResultat } from '../utils/submitInntektsmelding';

export enum BekreftOpplysningerFeilkoder {
  OK = 'OK',
  BEKREFT_OPPLYSNINGER = 'BEKREFT_OPPLYSNINGER'
}

export default function validerBekreftOpplysninger(validert: boolean) {
  let feilkoder: Array<ValiderResultat> = [];

  if (!validert) {
    feilkoder.push({
      felt: 'bekreft-opplysninger',
      code: BekreftOpplysningerFeilkoder.BEKREFT_OPPLYSNINGER
    });
  }

  return feilkoder;
}
