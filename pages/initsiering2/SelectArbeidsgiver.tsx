import { Select } from '@navikt/ds-react';
import { useState } from 'react';
import useSWR from 'swr';
import environment from '../../config/environment';
import Loading from './Loading';
import { logger } from '@navikt/next-logger';
import { ZodError } from 'zod';
import visFeilmeldingsTekst from '../../utils/visFeilmeldingsTekst';

function fetcher(url: string, idToken?: string) {
  if (!idToken) return Promise.resolve([]);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ idToken })
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Kunne ikke hente arbeidsforhold');
      }
      return res.json();
    })
    .catch((error) => {
      throw error;
    });
}

interface ArbeidsgiverSelect {
  orgnr: string;
  visningsnavn: string;
}

interface SelectArbeidsgiverProps {
  onChangeArbeidsgiverSelct: (e: any) => void;
  personnr?: string;
  feilmeldinger?: ZodError;
  skalViseFeilmeldinger: boolean;
}

export default function SelectArbeidsgiver({
  onChangeArbeidsgiverSelct,
  personnr,
  feilmeldinger,
  skalViseFeilmeldinger
}: SelectArbeidsgiverProps) {
  const idToken = personnr;
  const { data, error } = useSWR(
    [environment.hentArbeidsgivereUrl, idToken],
    ([url, idToken]) => fetcher(url, idToken),
    {
      refreshInterval: 0
    }
  );
  const [apiError, setApiError] = useState<string>('');

  if (!data) return <Loading />;

  const arbeidsgivere: ArbeidsgiverSelect[] =
    data && data.length > 0 && !error
      ? data.map((arbeidsgiver: any) => {
          return {
            orgnr: arbeidsgiver.orgnr,
            visningsnavn: `Org.nr. ${arbeidsgiver.orgnr} - ${arbeidsgiver.navn}`
          };
        })
      : [];

  if (error) {
    setApiError('Kunne ikke hente opplysninger om arbeidsforhold');
    logger.error(error);
  }

  if (data)
    return (
      <Select
        label='Organisasjon'
        onChange={onChangeArbeidsgiverSelct}
        error={visFeilmeldingsTekst('organisasjonsnummer', skalViseFeilmeldinger, feilmeldinger)}
        id='organisasjonsnummer'
      >
        <option value=''>Velg organisasjon</option>
        {arbeidsgivere.map((arbeidsgiver) => (
          <option value={arbeidsgiver.orgnr} key={arbeidsgiver.orgnr}>
            {arbeidsgiver.visningsnavn}
          </option>
        ))}
      </Select>
    );
}
