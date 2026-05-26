import { logger } from '@navikt/next-logger';
import { EndepunktSykepengesoeknader } from '../schema/EndepunktSykepengesoeknaderSchema';
import hentForespoerselId from './hentForespoerselId';

export default function hentForespoerselIdSSR(idListe?: string[]): Promise<EndepunktSykepengesoeknader> {
  logger.info(
    'Henter forespørsel ID kunne matche mot vedtaksperiode ID fra url: http://%s%s',
    globalThis.process.env.IM_API_URI,
    process.env.FORESPOERSEL_ID_LISTE_API
  );

  return hentForespoerselId(
    `http://${globalThis.process.env.IM_API_URI}${process.env.FORESPOERSEL_ID_LISTE_API}`,
    idListe
  );
}
