import { BodyLong, Button, Heading, Modal, Select } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import Arbeidsgiverperiode from './Arbeidsgiverperiode';
import localStyles from './EndrePerioderModal.module.css';
import { FravaersPeriode } from '../../utils/finnBestemmendeFravaersdag';
import numberOfDaysInRanges from '../../utils/numberOfDaysInRanges';
import { PeriodeParam } from '../Bruttoinntekt/Periodevelger';

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
  const [arbeidsgiverperioder, setArbeidsgiverperioder] = useState<Array<FravaersPeriode | undefined>>(
    props.arbeidsgiverperioder
  );
  const [visValideringBegrunnelse, setValideringBegrunnelse] = useState<boolean>(false);
  const [visValideringArbeidsgiverperiode, setValideringArbeidsgiverperiode] =
    useState<Array<ValideringsfeilArbeidsgiverperiode>>();
  const [visValideringPeriodelengde, setValideringPeriodelengde] = useState<boolean>(false);
  const [dagerIPeriode, setDagerIPeriode] = useState<number>(0);

  const validerArbeidsgiverperiode = (
    arbeidsgiverperioder: Array<FravaersPeriode | undefined>
  ): Array<ValideringsfeilArbeidsgiverperiode> => {
    const feil = arbeidsgiverperioder.map((periode) => {
      if (periode)
        return {
          fom: !periode.fom,
          tom: !periode.tom
        };
      else
        return {
          fom: false,
          tom: false
        };
    });

    return feil;
  };

  const begrunnelseKeys = Object.keys(begrunnelser);

  const rangeChangeHandler = (periode: PeriodeParam | undefined, periodeIndex: number) => {
    const aperioder = structuredClone(arbeidsgiverperioder);
    if (aperioder) {
      aperioder[periodeIndex] = {
        fom: periode!.fom!,
        tom: periode!.tom!
      };
      setArbeidsgiverperioder(aperioder);
    }
    setValideringArbeidsgiverperiode(validerArbeidsgiverperiode(aperioder));
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let valideringsfeilAP = validerArbeidsgiverperiode(arbeidsgiverperioder);
    setValideringArbeidsgiverperiode(valideringsfeilAP);

    let valideringsfeilBegrunnelse = false;
    if (!begrunnelse || begrunnelse.length < 1) {
      setValideringBegrunnelse(true);
      valideringsfeilBegrunnelse = true;
    } else {
      setValideringBegrunnelse(false);
    }

    let valideringsfeilPeriodelengde = false;
    const antallDager = numberOfDaysInRanges(arbeidsgiverperioder);
    setDagerIPeriode(antallDager);
    if (antallDager > 16) {
      setValideringPeriodelengde(true);
      valideringsfeilPeriodelengde = true;
    }

    if (
      !valideringsfeilPeriodelengde &&
      !valideringsfeilBegrunnelse &&
      !valideringsfeilAP?.reduce((prev, current) => prev || current.fom || current.tom, false)
    ) {
      setValideringPeriodelengde(false);

      const aperioder: Array<FravaersPeriode> = arbeidsgiverperioder.filter(
        (periode) => periode !== undefined
      ) as Array<FravaersPeriode>;

      props.onUpdate({
        arbeidsgiverperioder: aperioder,
        begrunnelse: begrunnelse!
      });
    }
  };

  const handleSlettArbeidsgiverperiode = (index: number) => {
    const aperioder = structuredClone(arbeidsgiverperioder);
    aperioder.splice(index, 1);
    setArbeidsgiverperioder(aperioder);
  };

  const handleLeggTilPeriode = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const aperioder: Array<FravaersPeriode | undefined> = structuredClone(arbeidsgiverperioder);
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
    if (!arbeidsgiverperioder || arbeidsgiverperioder.length !== props.arbeidsgiverperioder.length) {
      setArbeidsgiverperioder(props.arbeidsgiverperioder);
    }
  }, [props.arbeidsgiverperioder]); // eslint-disable-line

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
              arbeidsgiverperiode={periode!}
              rangeChangeHandler={(input) => rangeChangeHandler(input, index)}
              periodeIndex={index}
              onDelete={handleSlettArbeidsgiverperiode}
              hasError={visValideringArbeidsgiverperiode}
            />
          ))}
          {visValideringPeriodelengde && (
            <p className='navds-error-message navds-label'>
              Perioden er {dagerIPeriode} dager, men kan ikke være lengre enn 16 dager
            </p>
          )}
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
