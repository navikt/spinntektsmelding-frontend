import { Select } from '@navikt/ds-react';
import { useState } from 'react';
import useSWR from 'swr';
import environment from '../../config/environment';
import Loading from './Loading';
import { logger } from '@navikt/next-logger';
import visFeilmeldingsTekst from '../../utils/visFeilmeldingsTekst';
import { Feilmelding } from '../../components/Feilsammendrag/FeilListe';

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
  onChangeArbeidsgiverSelect: (e: any) => void;
  personnr?: string;
  feilmeldinger?: Feilmelding[];
  skalViseFeilmeldinger: boolean;
  id: string;
}

export default function SelectArbeidsgiver({
  onChangeArbeidsgiverSelect,
  personnr,
  feilmeldinger,
  skalViseFeilmeldinger,
  id
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
            orgnr: arbeidsgiver.organizationNumber,
            visningsnavn: `Org.nr. ${arbeidsgiver.organizationNumber} - ${arbeidsgiver.name}`
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
        onChange={onChangeArbeidsgiverSelect}
        error={visFeilmeldingsTekst(id, skalViseFeilmeldinger, feilmeldinger)}
        id={id}
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
