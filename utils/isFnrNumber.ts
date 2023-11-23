import fnrvalidator from '@navikt/fnrvalidator';

export default function isFnrNumber(fnr: string) {
  const status = fnrvalidator.idnr(fnr);
  return status.status === 'valid';
}
