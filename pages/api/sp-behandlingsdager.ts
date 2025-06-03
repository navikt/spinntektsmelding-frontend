// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';

import testdata from '../../mockdata/sp-soeknad.json';
import isMod11Number from '../../utils/isMod10Number';
import { EndepunktSykepengesoeknaderSchema } from '../../schema/EndepunktSykepengesoeknaderSchema';
import { z } from 'zod';
import safelyParseJSON from '../../utils/safelyParseJson';
import { min } from 'date-fns';

type forespoerselIdListeEnhet = {
  vedtaksperiodeId: string;
  forespoerselId: string;
};

function minDate(date1: string, date2: string): string {
  return date1 < date2 ? date1 : date2;
}
function maxDate(date1: string, date2: string): string {
  return date1 > date2 ? date1 : date2;
}

const basePath =
  'http://' + global.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS + global.process.env.FLEX_SYKEPENGESOEKNAD_URL;
const authApi = 'http://' + global.process.env.IM_API_URI + global.process.env.AUTH_SYKEPENGESOEKNAD_API;
const forespoerselIdListeApi = 'http://' + global.process.env.IM_API_URI + global.process.env.FORESPOERSEL_ID_LISTE_API;

export const config = {
  api: {
    externalResolver: true
  }
};

type Sykepengesoeknader = z.infer<typeof EndepunktSykepengesoeknaderSchema>;

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    setTimeout(() => res.status(200).json(testdata), 100);
    return;
  }

  const token = getToken(req);
  if (!token) {
    console.error('Mangler token i header');
    return res.status(401);
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    console.log('Validering feilet: ', validation.error);
    return res.status(401);
  }

  const requestBody = await req.body;
  const orgnr = requestBody.orgnummer;

  if (!isMod11Number(orgnr)) {
    console.error('Ugyldig orgnr: ', orgnr);
    return res.status(400).json({ error: 'Ugyldig organisasjonsnummer' });
  }

  const tokenResponse = await fetch(authApi + '/' + orgnr, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!tokenResponse.ok) {
    console.error('Feil ved kontroll av tilgang: ', tokenResponse.statusText);
    return res.status(tokenResponse.status).json({ error: 'Feil ved kontroll av tilgang' });
  }

  const obo = await requestOboToken(token, process.env.FLEX_SYKEPENGESOEKNAD_CLIENT_ID!);
  if (!obo.ok) {
    console.error('OBO-feil: ', obo.error);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const soeknadResponse = await fetch(basePath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${obo.token}`
    },
    body: JSON.stringify({
      orgnummer: requestBody.orgnummer,
      fnr: requestBody.fnr,
      eldsteFom: requestBody.eldsteFom
    })
  });

  if (!soeknadResponse.ok) {
    console.error('Feil ved henting av sykepengesøknader ', soeknadResponse.statusText);
    return res.status(soeknadResponse.status).json({ error: 'Feil ved kontroll av tilgang til sykepengesøknader' });
  }

  const soeknadData: Sykepengesoeknader = (await safelyParseJSON(soeknadResponse)) as Sykepengesoeknader;
  const aktiveSoeknader = soeknadData.filter((soeknad) => soeknad.soknadstype === 'BEHANDLINGSDAGER');

  if (aktiveSoeknader.length === 0) {
    console.log(
      'Ingen aktive behandlingsdager funnet for orgnr:',
      orgnr,
      ' selv om antall poster var:',
      soeknadData.length
    );
    return res.status(200).json([]);
  }

  const sykmeldingPerioder = [aktiveSoeknader[0]];

  aktiveSoeknader.forEach((soeknad) => {
    if (!sykmeldingPerioder.some((periode) => periode.sykmeldingId === soeknad.sykmeldingId)) {
      sykmeldingPerioder.push(soeknad);
    }
    sykmeldingPerioder.map((periode) => {
      if (periode.sykmeldingId === soeknad.sykmeldingId) {
        return {
          ...periode,
          behandlingsdager: [...(periode.behandlingsdager || []), ...soeknad.behandlingsdager],
          fom: minDate(periode.fom, soeknad.fom),
          tom: maxDate(periode.tom, soeknad.tom)
        };
      }
      return periode;
    });
  });
  // const idListe = aktiveSoeknader.map((soeknad) => soeknad.vedtaksperiodeId);
  // const forespoerselIdListe = await fetch(forespoerselIdListeApi, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${token}`
  //   },
  //   body: JSON.stringify({ vedtaksperiodeIdListe: idListe })
  // });

  // if (!forespoerselIdListe.ok) {
  //   console.error('Feil ved henting av forespørselIder ', forespoerselIdListe.statusText);
  //   return res.status(forespoerselIdListe.status).json({ error: 'Feil ved henting av forespørselIder' });
  // }

  // const forespoerselIdListeData: forespoerselIdListeEnhet[] = (await safelyParseJSON(
  //   forespoerselIdListe
  // )) as forespoerselIdListeEnhet[];

  // const soeknadResponseData = aktiveSoeknader.map((soeknad) => ({
  //   ...soeknad,
  //   forespoerselId: forespoerselIdListeData.find(
  //     (forespoersel) => soeknad.vedtaksperiodeId === forespoersel.vedtaksperiodeId
  //   )?.forespoerselId
  // }));
  console.log(
    'Hentet aktive behandlingsdager for orgnr:',
    orgnr,
    'antall:',
    sykmeldingPerioder.length,
    'fra:',
    aktiveSoeknader.length
  );

  return res.status(soeknadResponse.status).json(aktiveSoeknader);
};

export default handler;
