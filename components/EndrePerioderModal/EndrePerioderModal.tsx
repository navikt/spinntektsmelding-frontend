import { Alert, BodyLong, Button, Heading, Modal, Textarea } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
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
  arbeidsgiverperioder?: Array<FravaersPeriode>;
  begrunnelse: string;
}

export interface ValideringsfeilArbeidsgiverperiode {
  fom: boolean;
  tom: boolean;
}

export default function EndrePerioderModal(props: EndrePerioderModalProps) {
  useEffect(() => {
    Modal.setAppElement('#__next');
  });

  const [bestemmendeFravaersdag, setBestemmendeFravaersdag] = useState<Date>(props.bestemmendeFravaersdag);
  const [begrunnelse, setBegrunnelse] = useState<string | undefined>();
  const [arbeidsgiverperioder, setArbeidsgiverperioder] = useState<Array<FravaersPeriode>>(props.arbeidsgiverperioder);

  const [visAlertBestemmende, setVisAlertBestemmende] = useState<boolean>(false);

  const [visValideringBegrunnelse, setValideringBegrunnelse] = useState<boolean>(false);
  const [visValideringBestemmendeFravaersdag, setValideringBestemmendeFravaersdag] = useState<boolean>(false);
  const [visValideringArbeidsgiverperiode, setValideringArbeidsgiverperiode] =
    useState<Array<ValideringsfeilArbeidsgiverperiode>>();

  const validerArbeidsgiverperiode = (
    arbeidsgiverperioder: Array<FravaersPeriode>
  ): Array<ValideringsfeilArbeidsgiverperiode> => {
    const feil = arbeidsgiverperioder.map((periode) => ({
      fom: !periode.fom,
      tom: !periode.tom
    }));

    return feil;
  };

  const oppdatertBestemmendeFravaersdag = (dato: Date | undefined) => {
    setBestemmendeFravaersdag(dato!);
    if (bestemmendeFravaersdag) {
      setValideringBestemmendeFravaersdag(false);
    }
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
      if (bestemmendeFravaersdag && bestemmende !== formatIsoDate(bestemmendeFravaersdag)) {
        setVisAlertBestemmende(true);
      } else {
        setVisAlertBestemmende(false);
      }
    }

    setValideringArbeidsgiverperiode(validerArbeidsgiverperiode(aperioder));
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let valideringsfeilBF = false;
    if (!bestemmendeFravaersdag) {
      setValideringBestemmendeFravaersdag(true);
      valideringsfeilBF = true;
    } else {
      setValideringBestemmendeFravaersdag(false);
    }

    let valideringsfeilAP = validerArbeidsgiverperiode(arbeidsgiverperioder);
    setValideringArbeidsgiverperiode(valideringsfeilAP);

    let valideringsfeilBegrunnelse = false;
    if (!begrunnelse || begrunnelse.length < 1) {
      setValideringBegrunnelse(true);
      valideringsfeilBegrunnelse = true;
    } else {
      setValideringBegrunnelse(false);
    }

    if (
      !valideringsfeilBegrunnelse &&
      !valideringsfeilBF &&
      !valideringsfeilAP?.reduce((prev, current) => prev || current.fom || current.tom, false)
    ) {
      props.onUpdate({
        bestemmendFraværsdag: bestemmendeFravaersdag,
        arbeidsgiverperioder: arbeidsgiverperioder,
        begrunnelse: begrunnelse!
      });
    }
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

  const handleChangeBegrunnelse = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nyVerdi = event.target.value;
    setBegrunnelse(nyVerdi);
    if (nyVerdi && nyVerdi.length > 0) {
      setValideringBegrunnelse(false);
    }
  };

  useEffect(() => {
    setArbeidsgiverperioder(props.arbeidsgiverperioder);
  }, [props.arbeidsgiverperioder]);

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
            defaultDate={bestemmendeFravaersdag}
            onChangeDate={oppdatertBestemmendeFravaersdag}
            hasError={visValideringBestemmendeFravaersdag}
          />
          {visAlertBestemmende && (
            <div className={localStyles.alertwrapper}>
              <Alert variant='warning'>
                Det kan se ut som om bestemmende fraværsdag ikke stemmer overens med arbeidsgiverperioden. Dette trenger
                ikke å bety at den ikke er korrekt. Vennligst kontoller før du sender inn.
              </Alert>
            </div>
          )}
          {arbeidsgiverperioder.map((periode, index) => (
            <Arbeidsgiverperiode
              key={index}
              arbeidsgiverperiode={periode}
              rangeChangeHandler={rangeChangeHandler}
              periodeIndex={index}
              onDelete={(event) => handleSlettArbeidsgiverperiode(event, index)}
              hasError={visValideringArbeidsgiverperiode}
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
            onChange={handleChangeBegrunnelse}
            error={visValideringBegrunnelse && 'Feltet er obligatorisk.'}
            defaultValue={begrunnelse}
          />
          <Button>Bekreft</Button>
        </form>
      </Modal.Content>
    </Modal>
  );
}
