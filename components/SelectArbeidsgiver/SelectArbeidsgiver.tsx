import { Select } from '@navikt/ds-react';
import visFeilmeldingsTekst from '../../utils/visFeilmeldingsTekst';
import { Feilmelding } from '../Feilsammendrag/FeilListe';
import TextLabel from '../TextLabel';

export interface ArbeidsgiverSelect {
  orgnrUnderenhet: string;
  virksomhetsnavn: string;
}

interface SelectArbeidsgiverProps {
  onChangeArbeidsgiverSelect: (e: any) => void;
  arbeidsforhold: ArbeidsgiverSelect[];
  feilmeldinger?: Feilmelding[];
  skalViseFeilmeldinger: boolean;
  id: string;
}

export default function SelectArbeidsgiver({
  onChangeArbeidsgiverSelect,
  arbeidsforhold,
  feilmeldinger,
  skalViseFeilmeldinger,
  id
}: Readonly<SelectArbeidsgiverProps>) {
  const onChangeSelect = (e: any) => {
    onChangeArbeidsgiverSelect(e.target.value);
  };
  // visningsnavn: `Org.nr. ${arbeidsgiver.orgnrUnderenhet} - ${arbeidsgiver.virksomhetsnavn}`,
  if (arbeidsforhold.length === 1) {
    return (
      <>
        <TextLabel>Organisasjon</TextLabel>
        <p>{`Org.nr. ${arbeidsforhold[0].orgnrUnderenhet} - ${arbeidsforhold[0].virksomhetsnavn}`}</p>
      </>
    );
  }

  return (
    <Select
      label='Organisasjon'
      onChange={onChangeSelect}
      error={visFeilmeldingsTekst(id, skalViseFeilmeldinger, feilmeldinger)}
      id={id}
    >
      <option value=''>Velg organisasjon</option>
      {arbeidsforhold.map((arbeidsgiver) => (
        <option value={arbeidsgiver.orgnrUnderenhet} key={arbeidsgiver.orgnrUnderenhet}>
          {`Org.nr. ${arbeidsgiver.orgnrUnderenhet} - ${arbeidsgiver.virksomhetsnavn}`}
        </option>
      ))}
    </Select>
  );
}
