import { BodyShort } from '@navikt/ds-react';
import { IArbeidsforhold, LonnISykefravaeret, RefusjonskravetOpphoerer } from '../../state/state';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import Heading4 from '../Heading4';
import lokalStyle from './LonnUnderSykefravaeret.module.css';

interface LonnUnderSykefravaeretProps {
  lonn: { [key: string]: LonnISykefravaeret };
  arbeidsforhold: IArbeidsforhold;
  refusjonskravetOpphoerer?: { [key: string]: RefusjonskravetOpphoerer };
}

export default function LonnUnderSykefravaeret({
  lonn,
  arbeidsforhold,
  refusjonskravetOpphoerer
}: LonnUnderSykefravaeretProps) {
  if (lonn[arbeidsforhold.arbeidsforholdId].status === 'Nei') return <div className={lokalStyle.wrapper}>Nei</div>;

  return (
    <div className={lokalStyle.wrapper}>
      <BodyShort className={lokalStyle.svartekster}>Ja</BodyShort>
      {lonn[arbeidsforhold.arbeidsforholdId].belop && (
        <>
          <Heading4>Refusjonsbeløp per måned</Heading4>
          <BodyShort className={lokalStyle.svartekster}>
            {formatCurrency(lonn[arbeidsforhold.arbeidsforholdId].belop!)} kr/måned
          </BodyShort>
          {refusjonskravetOpphoerer && (
            <>
              <Heading4>Opphører refusjonkravet i perioden</Heading4>
              <BodyShort className={lokalStyle.svartekster}>
                {refusjonskravetOpphoerer[arbeidsforhold.arbeidsforholdId].status}
              </BodyShort>
              {refusjonskravetOpphoerer[arbeidsforhold.arbeidsforholdId].status === 'Ja' && (
                <>
                  <Heading4>Opphørsdato</Heading4>
                  <BodyShort className={lokalStyle.svartekster}>
                    {formatDate(refusjonskravetOpphoerer[arbeidsforhold.arbeidsforholdId].opphorsdato)}
                  </BodyShort>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
