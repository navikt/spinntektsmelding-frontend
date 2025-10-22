// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';

import testdata from '../../mockdata/sp-soeknad.json';
import isMod11Number from '../../utils/isMod11Number';
import { EndepunktSykepengesoeknaderSchema } from '../../schema/EndepunktSykepengesoeknaderSchema';
import { z } from 'zod';
import safelyParseJSON from '../../utils/safelyParseJson';

type forespoerselIdListeEnhet = {
  vedtaksperiodeId: string;
  forespoerselId: string;
};

const basePath =
  'http://' + globalThis.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS + globalThis.process.env.FLEX_SYKEPENGESOEKNAD_URL;
const authApi = 'http://' + globalThis.process.env.IM_API_URI + globalThis.process.env.AUTH_SYKEPENGESOEKNAD_API;
const forespoerselIdListeApi =
  'http://' + globalThis.process.env.IM_API_URI + globalThis.process.env.FORESPOERSEL_ID_LISTE_API;

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
  const aktiveSoeknader = soeknadData.filter((soeknad) => soeknad.vedtaksperiodeId);

  if (aktiveSoeknader.length === 0) {
    return res.status(200).json([]);
  }

  const idListe = aktiveSoeknader.map((soeknad) => soeknad.vedtaksperiodeId);
  const forespoerselIdListe = await fetch(forespoerselIdListeApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ vedtaksperiodeIdListe: idListe })
  });

  if (!forespoerselIdListe.ok) {
    console.error('Feil ved henting av forespørselIder ', forespoerselIdListe.statusText);
    return res.status(forespoerselIdListe.status).json({ error: 'Feil ved henting av forespørselIder' });
  }

  const forespoerselIdListeData: forespoerselIdListeEnhet[] = (await safelyParseJSON(
    forespoerselIdListe
  )) as forespoerselIdListeEnhet[];

  const soeknadResponseData = aktiveSoeknader.map((soeknad) => ({
    ...soeknad,
    forespoerselId: forespoerselIdListeData.find(
      (forespoersel) => soeknad.vedtaksperiodeId === forespoersel.vedtaksperiodeId
    )?.forespoerselId
  }));

  return res.status(soeknadResponse.status).json(soeknadResponseData);
};

export default handler;
