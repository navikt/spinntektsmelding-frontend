import type { Forespoersel } from '../../schema/EndepunktSykepengesoeknaderSchema';
import type { ArbeidsgiverSelect } from '../SelectArbeidsgiver/SelectArbeidsgiver';
import type { SykepengePeriode } from '../../utils/useInitieringData';
import useInitieringPeriodevalg from '../../utils/useInitieringPeriodevalg';
import { finnForespoerselId } from '../../utils/initieringPerioder';
import formatDate from '../../utils/formatDate';
import environment from '../../config/environment';
import OrdinaryJaNei from '../OrdinaryJaNei/OrdinaryJaNei';
import AlertKorrigereRefusjon from './AlertKorrigereRefusjon';
import { AlertEndreRefusjon } from './AlertEndreRefusjon';
import ForlengetPeriodeInfo from './ForlengetPeriodeInfo';

type InitieringRefusjonProps = Readonly<{
  perioder: SykepengePeriode[];
  forespoersler: Forespoersel[];
  organisasjonsnummer?: string;
  arbeidsforhold: ArbeidsgiverSelect[];
  fulltNavn?: string;
  fnr?: string;
  legend?: string;
}>;

export default function InitieringRefusjon({
  perioder,
  forespoersler,
  organisasjonsnummer,
  arbeidsforhold,
  fulltNavn,
  fnr,
  legend = 'Skal du endre refusjonen for den ansatte?'
}: InitieringRefusjonProps) {
  const { valgtePerioder, harValgtPeriodeMedForlengelse, endreRefusjon } = useInitieringPeriodevalg(
    perioder,
    forespoersler
  );

  if (!harValgtPeriodeMedForlengelse) {
    return null;
  }

  return (
    <>
      <OrdinaryJaNei legend={legend} name='endreRefusjon' />
      {endreRefusjon === 'Ja' && (
        <>
          <AlertKorrigereRefusjon />
          {valgtePerioder.map((periode) => {
            const vedtaksperiodeId = periode.forlengerVedtaksperiodeId;
            if (!vedtaksperiodeId) return null;

            const forespoerselId = finnForespoerselId(forespoersler, vedtaksperiodeId);
            const forlengetPeriode = perioder.find((periode) => periode.id === vedtaksperiodeId);
            return (
              <ForlengetPeriodeInfo
                key={periode.id}
                orgNr={organisasjonsnummer}
                arbeidsforhold={arbeidsforhold}
                navn={fulltNavn}
                fnr={fnr}
                href={forespoerselId ? `${environment.baseUrl}/${forespoerselId}` : undefined}
                fomDato={forlengetPeriode ? formatDate(forlengetPeriode.fom) : ''}
                tomDato={forlengetPeriode ? formatDate(forlengetPeriode.tom) : ''}
              />
            );
          })}
        </>
      )}
      {endreRefusjon === 'Nei' && <AlertEndreRefusjon />}
    </>
  );
}
