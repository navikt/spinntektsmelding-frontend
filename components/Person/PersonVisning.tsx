import TextLabel from '../TextLabel';
import useBoundStore from '../../state/useBoundStore';
import { shallow } from 'zustand/shallow';
import lokalStyles from './Person.module.css';
import DelvisInnsendingInfo from './DelvisInnsendingInfo';
import FeilVedHentingAvPersondata from './FeilVedHentingAvPersondata';
import AnsattDataVisning from './AnsattDataVisning';
import ArbeidsgiverDataVisning from './ArbeidsgiverDataVisning';

interface PersonProps {
  erDelvisInnsending?: boolean;
}

export default function Person({ erDelvisInnsending }: Readonly<PersonProps>) {
  const [sykmeldt, avsender] = useBoundStore((state) => [state.sykmeldt, state.avsender], shallow);

  return (
    <>
      <DelvisInnsendingInfo erDelvisInnsending={erDelvisInnsending} />
      <FeilVedHentingAvPersondata sykmeldt={sykmeldt} avsender={avsender} />
      <div className={lokalStyles.personInfoWrapper}>
        <AnsattDataVisning sykmeldt={sykmeldt} />

        <ArbeidsgiverDataVisning avsender={avsender}>
          <TextLabel>Telefon innsender</TextLabel>
          <div className={lokalStyles.virksomhetsnavn}>{avsender.tlf}</div>
        </ArbeidsgiverDataVisning>
      </div>
    </>
  );
}
