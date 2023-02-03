import { BodyLong, Button, Heading, Modal, Select } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import Arbeidsgiverperiode from './Arbeidsgiverperiode';
import { DateRange } from 'react-day-picker';
import localStyles from './EndrePerioderModal.module.css';
import { FravaersPeriode } from '../../utils/finnBestemmendeFravaersdag';

interface EndrePerioderModalProps {
  open: boolean;
  onClose: () => void;
  arbeidsgiverperioder: Array<FravaersPeriode>;
  onUpdate: (data: EndrePeriodeRespons) => void;
}

export interface EndrePeriodeRespons {
  arbeidsgiverperioder?: Array<FravaersPeriode>;
  begrunnelse: string;
}

export interface ValideringsfeilArbeidsgiverperiode {
  fom: boolean;
  tom: boolean;
}
interface Begrunnelser {
  [key: string]: string;
}

const begrunnelser: Begrunnelser = {
  FiskerMedHyre: 'Fisker med hyre',
  Saerregler: 'Særregler',
  FerieEllerAvspasering: 'Ferie eller avspassering'
};

export default function EndrePerioderModal(props: EndrePerioderModalProps) {
  useEffect(() => {
    Modal.setAppElement('#__next');
  });

  const [begrunnelse, setBegrunnelse] = useState<string | undefined>();
  const [arbeidsgiverperioder, setArbeidsgiverperioder] = useState<Array<FravaersPeriode>>(props.arbeidsgiverperioder);
  const [visValideringBegrunnelse, setValideringBegrunnelse] = useState<boolean>(false);
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

  const begrunnelseKeys = Object.keys(begrunnelser);

  const rangeChangeHandler = (periode: DateRange | undefined, periodeIndex: number) => {
    const aperioder = structuredClone(arbeidsgiverperioder);
    if (aperioder) {
      aperioder[periodeIndex] = {
        fom: periode!.from!,
        tom: periode!.to!
      };

      setArbeidsgiverperioder(aperioder);
    }

    setValideringArbeidsgiverperiode(validerArbeidsgiverperiode(aperioder));
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let valideringsfeilBF = false;

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

  const handleChangeBegrunnelse = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nyVerdi = event.currentTarget.value;
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
            Endring av arbeidsgiverperiode
          </Heading>

          <BodyLong spacing>
            Vi har brukt egenmelding og sykmelding for å beregne bestemmende fraværsdag og arbeidsgiverperiode. Hvis du
            anser at det er feil kan du endre disse datoene. Les mer om hvordan du beregner disse her.
          </BodyLong>

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
          <Select
            label={'Forklaring til endring'}
            onChange={handleChangeBegrunnelse}
            id={'lia-select'}
            className={localStyles.selectbegrunnelse}
            defaultValue={begrunnelse}
            error={visValideringBegrunnelse ? 'Velg begrunnelse' : null}
          >
            <option value=''>Velg begrunnelse</option>
            {begrunnelseKeys.map((begrunnelseKey) => (
              <option value={begrunnelseKey} key={begrunnelseKey}>
                {begrunnelser[begrunnelseKey]}
              </option>
            ))}
          </Select>
          <Button>Bekreft</Button>
        </form>
      </Modal.Content>
    </Modal>
  );
}
