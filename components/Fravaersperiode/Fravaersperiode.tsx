import { useCallback, useEffect } from 'react';
import { Periode } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import finnArbeidsgiverperiode from '../../utils/finnArbeidsgiverperiode';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';

interface FravaersperiodeProps {
  egenmeldingsperioder: Array<Periode>;
}
export default function Fravaersperiode({ egenmeldingsperioder }: FravaersperiodeProps) {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);

  // const setArbeidsgiverperioder = useBoundStore((state) => state.setArbeidsgiverperioder);

  // const ucSetArbeidsgiverperiode = useCallback(
  //   (agp: Periode[] | undefined) => setArbeidsgiverperioder(agp),
  //   [setArbeidsgiverperioder]
  // );

  // useEffect(() => {
  //   const perioder =
  //     fravaersperioder && egenmeldingsperioder ? fravaersperioder.concat(egenmeldingsperioder) : fravaersperioder;

  //   const fPerioder = perioder?.filter((periode) => periode.fom && periode.tom);

  //   if (fPerioder) {
  //     const agp = finnArbeidsgiverperiode(fPerioder);
  //     console.log('ucSetArbeidsgiverperiode');
  //     ucSetArbeidsgiverperiode(agp);
  //   }
  // }, [fravaersperioder, egenmeldingsperioder, ucSetArbeidsgiverperiode]);

  if (!fravaersperioder) return null;

  return (
    <>
      <Heading3>Sykmelding</Heading3>
      <p>
        I følge sykmeldingen var den ansatte syk i perioden som er ferdig utfylt. Sykmeldingsperioden brukes sammen med
        eventuelle egenmeldinger til å beregne arbeidsgiverperioden.
      </p>

      <FravaerEnkeltAnsattforhold fravaersperioder={fravaersperioder} />
    </>
  );
}
