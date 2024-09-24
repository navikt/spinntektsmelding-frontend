// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken, requestOboToken, validateToken } from '@navikt/oasis';

import testdata from '../../mockdata/sp-soeknad.json';
import isMod11Number from '../../utils/isMod10Number';

const basePath =
  'http://' + global.process.env.FLEX_SYKEPENGESOEKNAD_INGRESS + global.process.env.FLEX_SYKEPENGESOEKNAD_URL;

const authApi = 'http://' + global.process.env.IM_API_URI + global.process.env.AUTH_SYKEPENGESOEKNAD_API;

export const config = {
  api: {
    externalResolver: true
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<unknown>) => {
  const env = process.env.NODE_ENV;
  if (env == 'development') {
    setTimeout(() => {
      return res.status(200).json(testdata);
    }, 100);
  } else if (env == 'production') {
    const token = getToken(req);
    if (!token) {
      /* håndter manglende token */
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

    const erGyldigOrgnr = isMod11Number(orgnr);
    if (!erGyldigOrgnr) {
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
      /* håndter obo-feil */
      console.error('OBO-feil: ', obo.error);
      return res.status(401);
    }

    const body = {
      orgnummer: requestBody.orgnummer,
      fnr: requestBody.fnr,
      eldsteFom: requestBody.eldsteFom
    };

    const soeknadResponse = await fetch(basePath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${obo.token}`
      },
      body: JSON.stringify(body)
    });

    if (!soeknadResponse.ok) {
      console.error('Feil ved henting av sykepengesøknader ', soeknadResponse.statusText);
      console.error('Feilet med URL: ', basePath);
      console.error('Feilet med requestBody: ', body);

      return res.status(soeknadResponse.status).json({ error: 'Feil ved kontroll av tilgang til sykepengesøknader' });
    } else {
      const soeknadData = await soeknadResponse.json();
      return res.status(soeknadResponse.status).json(soeknadData);
    }
  }
};

export default handler;