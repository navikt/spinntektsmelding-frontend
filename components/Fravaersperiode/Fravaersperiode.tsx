import { BodyLong, Link } from '@navikt/ds-react';
import { useCallback, useEffect } from 'react';
import { Periode } from '../../state/state';
import useBoundStore from '../../state/useBoundStore';
import finnArbeidsgiverperiode from '../../utils/finnArbeidsgiverperiode';
import { FravaersPeriode } from '../../utils/finnBestemmendeFravaersdag';
import Heading3 from '../Heading3/Heading3';
import Arbeidsgiverperiode from './Arbeidsgiverperiode';
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

  const ucSetArbeidsgiverperiode = useCallback(
    (agp: FravaersPeriode[] | undefined) => setArbeidsgiverperioder(agp),
    [setArbeidsgiverperioder]
  );

  useEffect(() => {
    const perioder =
      fravaersperioder && egenmeldingsperioder ? fravaersperioder.concat(egenmeldingsperioder) : fravaersperioder;

    const fPerioder = perioder?.filter((periode) => periode.fom && periode.tom);

    if (fPerioder) {
      const agp = finnArbeidsgiverperiode(fPerioder);
      ucSetArbeidsgiverperiode(agp);
    }
  }, [fravaersperioder, egenmeldingsperioder, ucSetArbeidsgiverperiode]);

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
          <Arbeidsgiverperiode perioder={arbeidsgiverperioder} />. Hvis du mener dette er feil er det mulig å{' '}
          <Link onClick={setModalOpen} href='#'>
            korrigere her
          </Link>
          .
        </BodyLong>
      )}
    </>
  );
}
