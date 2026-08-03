import { UNSAFE_Combobox as UnsafeCombobox } from '@navikt/ds-react';
import TextLabel from '../TextLabel';
import { Controller } from 'react-hook-form';

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
  const visningLabel = label ?? 'Arbeidsgiver';
  const selectLabel = descriptionLabel ?? 'Organisasjon';
  if (arbeidsforhold.length === 1) {
    return (
      <>
        <TextLabel>{visningLabel}</TextLabel>
        <p>{`Orgnr. ${arbeidsforhold[0].orgnrUnderenhet} - ${arbeidsforhold[0].virksomhetsnavn}`}</p>
        <input type='hidden' value={arbeidsforhold[0].orgnrUnderenhet} name='organisasjonsnummer' {...register(id)} />
      </>
    );
  }

  const sortedArbeidsforhold = [...arbeidsforhold].sort((a, b) => a.virksomhetsnavn.localeCompare(b.virksomhetsnavn));

  const options = sortedArbeidsforhold.map((arbeidsgiver) => ({
    value: arbeidsgiver.orgnrUnderenhet,
    label: `Orgnr. ${arbeidsgiver.orgnrUnderenhet} - ${arbeidsgiver.virksomhetsnavn}`
  }));

  return (
    <Controller
      name={id}
      defaultValue={null}
      render={({ field }) => (
        <UnsafeCombobox
          label={selectLabel}
          error={error}
          description={description}
          options={options}
          ref={field.ref}
          name={field.name}
          onBlur={field.onBlur}
          onToggleSelected={(option, isSelected) => {
            if (isSelected) {
              field.onChange(option);
            } else {
              field.onChange(null);
            }
          }}
        />
      )}
    />
  );
}
