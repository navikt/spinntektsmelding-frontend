import { Datepicker } from '@navikt/ds-datepicker';
import { Button } from '@navikt/ds-react';
import styles from '../../styles/Home.module.css';
import localStyles from './Egenmelding.module.css';
import ButtonSlette from '../ButtonSlette/ButtonSlette';
import Heading3 from '../Heading3/Heading3';
import LabelLabel from '../LabelLabel/LabelLabel';
import useBoundStore from '../../state/useBoundStore';
import useEgenmeldingStore from '../../state/useEgenmeldingStore';

export default function Egenmelding() {
  const arbeidsforhold = useBoundStore((state) => state.arbeidsforhold);
  const flereArbeidsforhold = arbeidsforhold && arbeidsforhold.length > 1;
  const aktiveArbeidsforhold = useBoundStore((state) => state.aktiveArbeidsforhold);
  const egenmeldingsperioder = useEgenmeldingStore((state) => state.egenmeldingsperioder);
  const setEgenmeldingFraDato = useEgenmeldingStore((state) => state.setEgenmeldingFraDato);
  const setEgenmeldingTilDato = useEgenmeldingStore((state) => state.setEgenmeldingTilDato);
  const slettEgenmeldingsperiode = useEgenmeldingStore((state) => state.slettEgenmeldingsperiode);
  const leggTilEgenmeldingsperiode = useEgenmeldingStore((state) => state.leggTilEgenmeldingsperiode);

  return (
    <div className={localStyles.egenmeldingswrapper}>
      {aktiveArbeidsforhold().map((forhold) => (
        <div key={forhold.arbeidsforholdId}>
          <Heading3>
            Eventuell egenmelding {flereArbeidsforhold ? ` - ${forhold.arbeidsforhold}` : '(valgfri)'}
          </Heading3>
          <p>
            Dersom den ansatte var fraværende med egenmelding frem til sykmeldingen ble utstedt skal du oppgi første
            fraværsdag med egenmelding i dette feltet.
          </p>
          <div className={localStyles.egenmeldingswrapper}>
            {egenmeldingsperioder?.[forhold.arbeidsforholdId] &&
              egenmeldingsperioder?.[forhold.arbeidsforholdId].map((egenmeldingsperiode) => {
                return (
                  <div key={egenmeldingsperiode.id} className={styles.periodewrapper}>
                    <div className={styles.datepickerescape}>
                      <LabelLabel htmlFor={`fra-${egenmeldingsperiode.id}`} className={styles.datepickerlabel}>
                        Egenmelding fra dato
                      </LabelLabel>
                      <Datepicker
                        onChange={(dateString) => setEgenmeldingFraDato(dateString, egenmeldingsperiode.id)}
                        inputLabel='Egenmelding fra dato'
                        inputId={`fra-${egenmeldingsperiode.id}`}
                      />
                    </div>
                    <div className={styles.datepickerescape}>
                      <LabelLabel htmlFor={`til-${egenmeldingsperiode.id}`} className={styles.datepickerlabel}>
                        Egenmelding til dato
                      </LabelLabel>
                      <Datepicker
                        inputLabel='Egenmelding til dato'
                        inputId={`til-${egenmeldingsperiode.id}`}
                        onChange={(dateString) => setEgenmeldingTilDato(dateString, egenmeldingsperiode.id)}
                        locale={'nb'}
                      />
                    </div>
                    <div className={styles.endresykemelding}>
                      <ButtonSlette
                        onClick={() => slettEgenmeldingsperiode(egenmeldingsperiode.id)}
                        title='Slett egenmeldingsperiode'
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          <div>
            <Button
              variant='secondary'
              className={styles.legtilbutton}
              onClick={() => leggTilEgenmeldingsperiode(forhold.arbeidsforholdId)}
            >
              Legg til egenmeldingsperiode
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
