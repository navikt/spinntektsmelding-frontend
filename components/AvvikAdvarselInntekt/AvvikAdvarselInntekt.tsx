import { Alert, BodyLong } from '@navikt/ds-react';
import { HistoriskInntekt } from '../../schema/historiskInntektSchema';
import sjekkOmFerieMaaneder from '../../utils/sjekkOmFerieMaaneder';
import lokalStyles from './AvvikAdvarselInntekt.module.css';

interface AvvikAdvarselInntektProps {
  tidligereInntekter?: HistoriskInntekt;
}

const AvvikAdvarselInntekt: React.FunctionComponent<AvvikAdvarselInntektProps> = ({
  tidligereInntekter
}: AvvikAdvarselInntektProps) => {
  const arrTidligereInntekter = Array.from(tidligereInntekter || []);
  const erFeriemaaneder = sjekkOmFerieMaaneder(tidligereInntekter);
  const manglendeEller0FraAmeldingen =
    !arrTidligereInntekter || arrTidligereInntekter?.filter((inntekt) => !inntekt[1]).length > 0;
  const harTidligereInntekt = arrTidligereInntekter && arrTidligereInntekter.length > 0;

  if (!tidligereInntekter) {
    return null;
  }

  return (
    <>
      {!harTidligereInntekt && (
        <BodyLong>
          Angi bruttoinntekt som snitt av gjennomsnitt tre måneders lønn. Dersom inntekten har gått opp pga. varig -
          lønnsforhøyelse, og ikke for eksempel representerer uforutsett overtid kan dette gjøre at inntekten settes
          høyere enn gjennomsnitt av siste tre måneder.
        </BodyLong>
      )}
      {harTidligereInntekt && manglendeEller0FraAmeldingen && (
        <Alert variant='warning' className={lokalStyles.feriealert}>
          Lønnsopplysningene inneholder måneder uten rapportert inntekt. Vi estimerer beregnet månedslønn til et snitt
          av innrapportert inntekt for de tre siste månedene. Hvis du ser at det skal være en annen beregnet månedslønn
          må du endre dette manuelt.
        </Alert>
      )}
      {erFeriemaaneder && (
        <Alert variant='warning' className={lokalStyles.feriealert}>
          Lønnsopplysningene kan inneholde feriepenger. Hvis det er utbetalt feriepenger eller avviklet ferie uten lønn,
          skal beregnet månedslønn settes til den ordinære lønnen.
        </Alert>
      )}
    </>
  );
};

export default AvvikAdvarselInntekt;
