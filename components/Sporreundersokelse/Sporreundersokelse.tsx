import { BodyLong, Button } from '@navikt/ds-react';
import fjStyles from '../../components/FlexJarResponse/FlexJarResponse.module.css';
import TextLabel from '../TextLabel';
import Link from 'next/link';

export default function Sporreundersokelse() {
  return (
    <div className={fjStyles.outerjarwrapper + ' skjul-fra-print'}>
      <div className={fjStyles.jarwrapper + ' skjul-fra-print'}>
        <TextLabel>Spørreundersøkelse om den nye inntektsmeldingen</TextLabel>
        <BodyLong>
          NAV ønsker å få innspill i hvordan dere oppfatter innsending av den nye inntektsmeldingen på nav.no i
          forbindelse med sykmelding av ansatte. Undersøkelsen tar ikke mer enn noen minutt. Svarene dere oppgir i
          spørreundersøkelsen kan ikke kobles til dere og den er helt anonym.
        </BodyLong>
        <Link href='https://www.survey-xact.no/LinkCollector?key=PEL2QK18SK9J' target='_blank'>
          <Button variant='primary'>Ta undersøkelsen</Button>
        </Link>
      </div>
    </div>
  );
}
