import safelyParseJSON from '../../utils/safelyParseJson';
import { z } from 'zod';
import { EndepunktSykepengesoeknaderSchema } from '../../schema/EndepunktSykepengesoeknaderSchema';

type Sykepengesoeknader = z.infer<typeof EndepunktSykepengesoeknaderSchema>;

interface FetchSoeknaderInput {
  basePath: string;
  token: string;
  requestBody: { orgnummer: string; fnr: string; eldsteFom?: string };
}

export async function fetchSoeknader({ basePath, token, requestBody }: FetchSoeknaderInput) {
  const soeknadResponse = await fetch(basePath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!soeknadResponse.ok) {
    throw new Error('Feil ved henting av sykepengesøknader');
  }

  const soeknadData: Sykepengesoeknader = (await safelyParseJSON(soeknadResponse)) as Sykepengesoeknader;
  return soeknadData;
}

export function mapAktiveSoeknader(data: Sykepengesoeknader) {
  return data.filter((soeknad) => soeknad.vedtaksperiodeId);
}

export function mapBehandlingsdager(data: Sykepengesoeknader) {
  const aktive = [...(data ?? [])].filter((s) => s.soknadstype === 'BEHANDLINGSDAGER');
  if (aktive.length === 0) return [];

  function minDate(a: string, b: string) {
    return a < b ? a : b;
  }
  function maxDate(a: string, b: string) {
    return a > b ? a : b;
  }

  let samlet = [aktive[0]];
  aktive.forEach((soeknad) => {
    if (!samlet.some((p) => p.sykmeldingId === soeknad.sykmeldingId)) {
      samlet.push(soeknad);
    }
    samlet = samlet.map((periode) => {
      if (periode.sykmeldingId === soeknad.sykmeldingId) {
        return {
          ...periode,
          behandlingsdager: [...new Set([...(periode.behandlingsdager ?? []), ...(soeknad.behandlingsdager ?? [])])],
          fom: minDate(periode.fom, soeknad.fom),
          tom: maxDate(periode.tom, soeknad.tom)
        };
      }
      return periode;
    });
  });
  return samlet;
}
