import { Select } from '@navikt/ds-react';
import TextLabel from '../TextLabel';

export interface ArbeidsgiverSelect {
  orgnrUnderenhet: string;
  virksomhetsnavn: string;
}

interface SelectArbeidsgiverProps {
  arbeidsforhold: ArbeidsgiverSelect[];
  id: string;
  register: any;
  error?: string;
  label?: string;
  description?: string;
  descriptionLabel?: string;
}

export default function SelectArbeidsgiver({
  arbeidsforhold,
  id,
  register,
  error,
  label,
  description,
  descriptionLabel
}: Readonly<SelectArbeidsgiverProps>) {
  const visningLabel = label || 'Arbeidsgiver';
  const selectLabel = descriptionLabel || 'Organisasjon';
  if (arbeidsforhold.length === 1) {
    return (
      <>
        <TextLabel>{visningLabel}</TextLabel>
        <p>{`Orgnr. ${arbeidsforhold[0].orgnrUnderenhet} - ${arbeidsforhold[0].virksomhetsnavn}`}</p>
        <input type='hidden' value={arbeidsforhold[0].orgnrUnderenhet} name='organisasjonsnummer' {...register(id)} />
      </>
    );
  }

  return (
    <Select label={selectLabel} error={error} description={description} {...register(id)}>
      <option value='-'>Velg organisasjon</option>
      {arbeidsforhold.map((arbeidsgiver) => (
        <option value={arbeidsgiver.orgnrUnderenhet} key={arbeidsgiver.orgnrUnderenhet}>
          {`Orgnr. ${arbeidsgiver.orgnrUnderenhet} - ${arbeidsgiver.virksomhetsnavn}`}
        </option>
      ))}
    </Select>
  );
}
