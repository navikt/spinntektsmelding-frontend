import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import { TextField } from '@navikt/ds-react';
import Heading2 from '../Heading2/Heading2';
import Skillelinje from '../Skillelinje/Skillelinje';
import { useFormContext } from 'react-hook-form';
import DelvisInnsendingInfo from './DelvisInnsendingInfo';
import FeilVedHentingAvPersondata from './FeilVedHentingAvPersondata';
import AnsattDataVisning from './AnsattDataVisning';
import ArbeidsgiverDataVisning from './ArbeidsgiverDataVisning';

interface PersonProps {
  erDelvisInnsending?: boolean;
}

export default function Person({ erDelvisInnsending }: Readonly<PersonProps>) {
  const [sykmeldt, avsender] = useBoundStore((state) => [state.sykmeldt, state.avsender], shallow);
  const {
    formState: { errors },
    register
  } = useFormContext();

  const hentingAvArbeidsgiverdataFeilet = avsender.orgNavn === null;

  const skjemadataErLastet = !!sykmeldt.fnr;

  return (
    <>
      <Heading2 size='large'>Inntektsmelding</Heading2>
      <p>
        For at vi skal utbetale riktig beløp i forbindelse med sykmelding, må du bekrefte eller oppdatere opplysningene
        vi har om den ansatte og sykefraværet. Den ansatte kan se inntektsmeldinger som er sendt inn.
      </p>
      <Skillelinje />

      <FeilVedHentingAvPersondata sykmeldt={sykmeldt} avsender={avsender} />

      <DelvisInnsendingInfo erDelvisInnsending={erDelvisInnsending} />

      <div className={lokalStyles.personInfoWrapper}>
        <AnsattDataVisning sykmeldt={sykmeldt} />

        <ArbeidsgiverDataVisning avsender={avsender}>
          <TextField
            label='Telefon innsender'
            type='tel'
            autoComplete='tel'
            readOnly={!skjemadataErLastet}
            {...register('avsenderTlf')}
            error={errors.avsenderTlf?.message as string}
          />
        </ArbeidsgiverDataVisning>
      </div>
    </>
  );
}
