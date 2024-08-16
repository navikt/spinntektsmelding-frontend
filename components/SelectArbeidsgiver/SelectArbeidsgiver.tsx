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
}

export default function SelectArbeidsgiver({ arbeidsforhold, id, register, error }: Readonly<SelectArbeidsgiverProps>) {
  if (arbeidsforhold.length === 1) {
    return (
      <>
        <TextLabel>Arbeidsgiver</TextLabel>
        <p>{`Orgnr. ${arbeidsforhold[0].orgnrUnderenhet} - ${arbeidsforhold[0].virksomhetsnavn}`}</p>
        <input type='hidden' value={arbeidsforhold[0].orgnrUnderenhet} name='organisasjonsnummer' {...register(id)} />
      </>
    );
  }

  return (
    <Select label='Organisasjon' error={error} {...register(id)}>
      <option value='-'>Velg organisasjon</option>
      {arbeidsforhold.map((arbeidsgiver) => (
        <option value={arbeidsgiver.orgnrUnderenhet} key={arbeidsgiver.orgnrUnderenhet}>
          {`Orgnr. ${arbeidsgiver.orgnrUnderenhet} - ${arbeidsgiver.virksomhetsnavn}`}
        </option>
      ))}
    </Select>
  );
}
