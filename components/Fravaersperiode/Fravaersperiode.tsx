import { BodyLong, Link } from '@navikt/ds-react';
import { useEffect } from 'react';
import { Periode } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import finnArbeidsgiverperiode from '../../utils/finnArbeidsgiverperiode';
import formatDate from '../../utils/formatDate';
import Heading3 from '../Heading3/Heading3';
import FravaerEnkeltAnsattforhold from './FravaerEnkeltAnsattforhold';

interface FravaersperiodeProps {
  egenmeldingsperioder: Array<Periode>;
  setModalOpen: () => void;
}
export default function Fravaersperiode({ egenmeldingsperioder, setModalOpen }: FravaersperiodeProps) {
  const fravaersperioder = useBoundStore((state) => state.fravaersperioder);

  const [arbeidsgiverperioder, setArbeidsgiverperioder] = useBoundStore((state) => [
    state.arbeidsgiverperioder,
    state.setArbeidsgiverperioder
  ]);

  useEffect(() => {
    const perioder =
      fravaersperioder && egenmeldingsperioder ? fravaersperioder.concat(egenmeldingsperioder) : fravaersperioder;
    if (perioder) {
      const agp = finnArbeidsgiverperiode(perioder);
      setArbeidsgiverperioder(agp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fravaersperioder, egenmeldingsperioder]);

  if (!fravaersperioder) return null;

  return (
    <>
      <Heading3>Sykmeldingsperiode</Heading3>
      <p>
        I følge sykmeldingen var den ansatte syk i perioden som er ferdig utfylt. Sykmeldingsperioden brukes sammen med
        eventuelle egenmeldinger til å beregne arbeidsgiverperioden.
      </p>

      <FravaerEnkeltAnsattforhold fravaersperioder={fravaersperioder} />
      {arbeidsgiverperioder?.[0] && (
        <BodyLong>
          Basert på eventuell egenmelding og sykmeldingsperiode beregner NAV arbeidsgiverperioden til{' '}
          <strong>{formatDate(arbeidsgiverperioder[0].fom)}</strong> til{' '}
          <strong>{formatDate(arbeidsgiverperioder[0].tom)}</strong>. Hvis du mener dette er feil er det mulig å{' '}
          <Link onClick={setModalOpen}>korrigere her.</Link>
        </BodyLong>
      )}
    </>
  );
}
