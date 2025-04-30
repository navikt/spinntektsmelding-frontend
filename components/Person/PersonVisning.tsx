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
  const [sykmeldt, avsender, feilHentingAvPersondata, feilHentingAvArbeidsgiverdata] = useBoundStore(
    (state) => [state.sykmeldt, state.avsender, state.feilHentingAvPersondata, state.feilHentingAvArbeidsgiverdata],
    shallow
  );

  const hentingAvPersondataFeilet = feilHentingAvPersondata && feilHentingAvPersondata.length > 0;
  const hentingAvArbeidsgiverdataFeilet = feilHentingAvArbeidsgiverdata && feilHentingAvArbeidsgiverdata.length > 0;

  return (
    <>
      <DelvisInnsendingInfo erDelvisInnsending={erDelvisInnsending} />
      <FeilVedHentingAvPersondata
        hentingAvPersondataFeilet={hentingAvPersondataFeilet}
        hentingAvArbeidsgiverdataFeilet={hentingAvArbeidsgiverdataFeilet}
      />
      <div className={lokalStyles.personInfoWrapper}>
        <AnsattDataVisning sykmeldt={sykmeldt} hentingAvPersondataFeilet={hentingAvPersondataFeilet} />

        <ArbeidsgiverDataVisning avsender={avsender} hentingAvArbeidsgiverdataFeilet={hentingAvArbeidsgiverdataFeilet}>
          <TextLabel>Telefon innsender</TextLabel>
          <div className={lokalStyles.virksomhetsnavn}>{avsender.tlf}</div>
        </ArbeidsgiverDataVisning>
      </div>
    </>
  );
}
