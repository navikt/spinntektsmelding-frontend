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
  sykmeldt?: any;
  avsender?: any;
}

export default function Person({ erDelvisInnsending, sykmeldt, avsender }: Readonly<PersonProps>) {
  const [storeSykmeldt, storeAvsender] = useBoundStore((state) => [state.sykmeldt, state.avsender], shallow);

  const aktivSykmeldt = sykmeldt || storeSykmeldt;
  const aktivAvsender = avsender || storeAvsender;
  return (
    <>
      <DelvisInnsendingInfo erDelvisInnsending={erDelvisInnsending} />
      <FeilVedHentingAvPersondata sykmeldt={aktivSykmeldt} avsender={aktivAvsender} />
      <div className={lokalStyles.personInfoWrapper}>
        <AnsattDataVisning sykmeldt={aktivSykmeldt} />

        <ArbeidsgiverDataVisning avsender={aktivAvsender}>
          <TextLabel>Telefon innsender</TextLabel>
          <div className={lokalStyles.virksomhetsnavn}>{aktivAvsender.tlf}</div>
        </ArbeidsgiverDataVisning>
      </div>
    </>
  );
}
