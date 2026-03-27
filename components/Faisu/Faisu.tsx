import { BodyLong, Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import Heading1 from '../Heading1/Heading1';
import Skillelinje from '../Skillelinje/Skillelinje';
import localStyles from './Faisu.module.css';
import NumberField from '../NumberField/NumberField';
import { useState } from 'react';

const mockData = {
  arbeidsforhold: [
    {
      id: '9132103',
      stillingsprosent: 100,
      beskrivelse: 'RENOLDSARBEIDER',
      maanedslonn: 35000
    },
    {
      id: '9132104',
      stillingsprosent: 50,
      beskrivelse: 'RENOLDSARBEIDER',
      maanedslonn: 17500
    }
  ]
};
interface FaisuProps {
  harGradertSykmeldingOgFlereArbeidsforhold?: boolean;
}

export default function Faisu({ harGradertSykmeldingOgFlereArbeidsforhold }: FaisuProps) {
  const [inntektChecked, setInntektChecked] = useState<string | undefined>(undefined);
  const [alleArbeidsforhold, setAlleArbeidsforhold] = useState<string | undefined>(undefined);
  const [valgteArbeidsforhold, setValgteArbeidsforhold] = useState<string[]>([]);
  if (!harGradertSykmeldingOgFlereArbeidsforhold) {
    return null;
  }

  const aktuelleArbeidsforhold = mockData.arbeidsforhold.filter((arbeidsforhold) =>
    valgteArbeidsforhold.includes(arbeidsforhold.id)
  );

  const handleLikInntektCheckboxChange = (value: string) => {
    setInntektChecked(value);
    if (value === 'Ja') {
      setAlleArbeidsforhold(undefined);
      setValgteArbeidsforhold([]);
    }
  };

  const handleAlleArbeidsforholdCheckboxChange = (value: string) => {
    setAlleArbeidsforhold(value);
    if (value === 'Ja') {
      setValgteArbeidsforhold([]);
    }
  };

  const handleArbeidsforholdCheckboxCheck = (value: string[]) => {
    setValgteArbeidsforhold(value);
  };

  return (
    <>
      <Skillelinje />
      <Heading1>Månedslønn - Flere arbeidsforhold</Heading1>
      <BodyLong>Det er registert flere arbeidsforhold i samme underenhet og Nav trenger ekstra informasjon.</BodyLong>
      <RadioGroup
        legend='Har ansatt lik eller tilnærmet lik lønn i arbeidsforholdene (timelønn)?'
        className={localStyles.radiobuttonWrapper}
        onChange={handleLikInntektCheckboxChange}
        value={inntektChecked}
      >
        <Radio value='Ja'>Ja</Radio>
        <Radio value='Nei'>Nei</Radio>
      </RadioGroup>
      {inntektChecked === 'Nei' && (
        <>
          <RadioGroup
            legend='Er personen sykmeldt fra alle arbeidsforhold?'
            className={localStyles.radiobuttonWrapper}
            onChange={handleAlleArbeidsforholdCheckboxChange}
            value={alleArbeidsforhold}
          >
            <Radio value='Ja'>Ja</Radio>
            <Radio value='Nei'>Nei</Radio>
          </RadioGroup>
          {alleArbeidsforhold === 'Nei' && (
            <>
              <CheckboxGroup
                legend='Hvilket arbeidsforhold gjelder sykefraværet for?'
                onChange={handleArbeidsforholdCheckboxCheck}
              >
                {mockData.arbeidsforhold.map((arbeidsforhold) => (
                  <Checkbox key={arbeidsforhold.id} value={arbeidsforhold.id}>
                    {`${arbeidsforhold.beskrivelse}`}
                  </Checkbox>
                ))}
              </CheckboxGroup>
              {aktuelleArbeidsforhold.map((arbeidsforhold, index) => (
                <NumberField
                  className={localStyles.inputInntekt}
                  label={`Oppgi spesifisert månedslønn for - ${arbeidsforhold.beskrivelse}`}
                  key={`maanedslonn-${arbeidsforhold.id ?? index}`}
                />
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}
