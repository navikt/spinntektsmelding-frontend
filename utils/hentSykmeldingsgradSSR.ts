import { EndepunktSykepengesoeknader } from '../schema/EndepunktSykepengesoeknaderSchema';
import hentSykepengesoeknader from './hentSykepengesoeknader';

export default function hentSykmeldingsgradSSR(
  token?: string,
  orgnr?: string,
  fnr?: string,
  eldsteFom?: string
): Promise<EndepunktSykepengesoeknader> {
  return hentSykepengesoeknader(
    `http://${globalThis.process.env.IM_API_URI}${process.env.FLEX_SYKEPENGESOEKNAD_URL}`,
    token,
    orgnr,
    fnr,
    eldsteFom
  );
}
