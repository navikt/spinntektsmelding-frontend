import { logger } from '@navikt/next-logger';
import { EndepunktSykepengesoeknader } from '../schema/EndepunktSykepengesoeknaderSchema';
import hentSykepengesoeknader from './hentSykepengesoeknader';

export default function hentSykmeldingsgradSSR(
  token?: string,
  orgnr?: string,
  fnr?: string,
  eldsteFom?: string
): Promise<EndepunktSykepengesoeknader> {
  logger.info(
    'Henter sykepengesøknader for å finne sykmeldingsgrad for søknad fra url: http://%s%s',
    globalThis.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS,
    process.env.FLEX_SYKEPENGESOEKNAD_URL
  );

  return hentSykepengesoeknader(
    `http://${globalThis.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS}${process.env.FLEX_SYKEPENGESOEKNAD_URL}`,
    token,
    orgnr,
    fnr,
    eldsteFom
  );
}
