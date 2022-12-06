import { BodyLong, Button, Heading, Modal, Textarea } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import Arbeidsgiverperiode from './Arbeidsgiverperiode';
import BestemmendeFravaersdag from './BestemmendeFravaersdag';
import { DateRange } from 'react-day-picker';
import localStyles from './EndrePerioderModal.module.css';
import finnBestemmendeFravaersdag, { FravaersPeriode } from '../../utils/finnBestemmendeFravaersdag';
import { MottattPeriode } from '../../state/MottattData';
import formatIsoDate from '../../utils/formatIsoDate';

interface EndrePerioderModalProps {
  open: boolean;
  onClose: () => void;
  arbeidsgiverperioder: Array<FravaersPeriode>;
  bestemmendeFravaersdag: Date;
  onUpdate: (data: EndrePeriodeRespons) => void;
}

export interface EndrePeriodeRespons {
  bestemmendFraværsdag: Date;
  arbeidsgiverperioder: Array<FravaersPeriode | undefined>;
  begrunnelse: string;
}

export default function EndrePerioderModal(props: EndrePerioderModalProps) {
  useEffect(() => {
    Modal.setAppElement('#__next');
  }, []);

  const [bestemmendeFravaersdag, setBestemmendeFravaersdag] = useState<Date>(props.bestemmendeFravaersdag);
  const [begrunnelse, setBegrunnelse] = useState<string | undefined>();
  const [arbeidsgiverperioder, setArbeidsgiverperioder] = useState<Array<FravaersPeriode>>(props.arbeidsgiverperioder);

  const oppdatertBestemmendeFravaersdag = (dato: Date | undefined) => {
    setBestemmendeFravaersdag(dato!);
  };

  const rangeChangeHandler = (periode: DateRange | undefined, periodeIndex: number) => {
    const aperioder = structuredClone(arbeidsgiverperioder);
    if (aperioder) {
      aperioder[periodeIndex] = {
        fom: periode!.from!,
        tom: periode!.to!
      };

      setArbeidsgiverperioder(aperioder);

      const bestemmende = finnBestemmendeFravaersdag(aperioder as unknown as Array<MottattPeriode>);
      if (bestemmende !== formatIsoDate(bestemmendeFravaersdag)) {
      }
    }
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(bestemmendeFravaersdag);
    props.onUpdate({
      bestemmendFraværsdag: bestemmendeFravaersdag,
      arbeidsgiverperioder: arbeidsgiverperioder,
      begrunnelse: begrunnelse!
    });
  };

  const handleSlettArbeidsgiverperiode = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    const aperioder = structuredClone(arbeidsgiverperioder);
    aperioder.splice(index, 1);
    setArbeidsgiverperioder(aperioder);
  };

  const handleLeggTilPeriode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const aperioder = structuredClone(arbeidsgiverperioder);
    aperioder.push(undefined);
    setArbeidsgiverperioder(aperioder);
  };

  return (
    <Modal
      open={props.open}
      aria-label='Endring av bestemmende fraværsdag / arbeidsgiverperiode'
      onClose={props.onClose}
      aria-labelledby='modal-heading'
    >
      <Modal.Content className={localStyles.modalwrapper}>
        <form onSubmit={handleOnSubmit}>
          <Heading spacing level='1' size='large' id='modal-heading'>
            Endring av bestemmende fraværsdag / arbeidsgiverperiode
          </Heading>

          <BodyLong spacing>
            Vi har brukt egenmelding og sykmelding for å beregne bestemmende fraværsdag og arbeidsgiverperiode. Hvis du
            anser at det er feil kan du endre disse datoene. Les mer om hvordan du beregner disse her.
          </BodyLong>

          <BestemmendeFravaersdag
            defaultDate={props.bestemmendeFravaersdag}
            onChangeDate={oppdatertBestemmendeFravaersdag}
          />
          <Alert variant='warning'>
            Det kan se ut som om bestemmende fraværsdag ikke stemmer med arbeidsgiverperioden. Vennligs se over før du
            sender inn.
          </Alert>
          {arbeidsgiverperioder.map((periode, index) => (
            <Arbeidsgiverperiode
              key={index}
              arbeidsgiverperiode={periode}
              rangeChangeHandler={rangeChangeHandler}
              periodeIndex={index}
              onDelete={(event) => handleSlettArbeidsgiverperiode(event, index)}
            />
          ))}
          <Button
            variant='secondary'
            className={localStyles.legtilbutton}
            onClick={(event) => handleLeggTilPeriode(event)}
          >
            Legg til periode
          </Button>
          <Textarea
            className={localStyles.tekstomraade}
            label='Forklaring til endring'
            onChange={(event) => setBegrunnelse(event.target.value)}
          />
          <Button>Bekreft</Button>
        </form>
      </Modal.Content>
    </Modal>
  );
}
