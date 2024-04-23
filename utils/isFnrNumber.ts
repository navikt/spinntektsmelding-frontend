import { idnr } from '@navikt/fnrvalidator';

export default function isFnrNumber(fnr: string) {
  const status = idnr(fnr);
  return status.status === 'valid';
}
