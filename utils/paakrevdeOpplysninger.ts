import skjemaVariant from '../config/skjemavariant';
import { Opplysningstype } from '../state/useForespurtDataStore';

export default function paakrevdOpplysningstyper(forespurtData) {
  if (forespurtData) {
    return Object.keys(forespurtData).filter(
      (key) => forespurtData[key as keyof typeof forespurtData].paakrevd === true
    ) as Array<Opplysningstype>;
  }

  return Object.keys(skjemaVariant) as Array<Opplysningstype>;
}
