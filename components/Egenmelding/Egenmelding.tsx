import { Datepicker } from '@navikt/ds-datepicker';
import { Button, Checkbox } from '@navikt/ds-react';
import styles from '../../styles/Home.module.css';
import localStyles from './Egenmelding.module.css';
import ButtonSlette from '../ButtonSlette/ButtonSlette';
import Heading3 from '../Heading3/Heading3';
import LabelLabel from '../LabelLabel/LabelLabel';
import useBoundStore from '../../state/useBoundStore';
import formatIsoDate from '../../utils/formatIsoDate';

export default function Egenmelding() {
  const arbeidsforhold = useBoundStore((state) => state.arbeidsforhold);
  const flereArbeidsforhold = arbeidsforhold && arbeidsforhold.length > 1;
  const aktiveArbeidsforhold = useBoundStore((state) => state.aktiveArbeidsforhold);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const setEgenmeldingFraDato = useBoundStore((state) => state.setEgenmeldingFraDato);
  const setEgenmeldingTilDato = useBoundStore((state) => state.setEgenmeldingTilDato);
  const slettEgenmeldingsperiode = useBoundStore((state) => state.slettEgenmeldingsperiode);
  const leggTilEgenmeldingsperiode = useBoundStore((state) => state.leggTilEgenmeldingsperiode);
  const setSammeEgenmeldingsperiodeArbeidsforhold = useBoundStore(
    (state) => state.setSammeEgenmeldingsperiodeArbeidsforhold
  );
  const sammeEgenmeldingsperiode = useBoundStore((state) => state.sammeEgenmeldingsperiode);
  const flereEnnToArbeidsforhold: boolean = !!arbeidsforhold && arbeidsforhold.length > 2;

  return (
    <div className={localStyles.egenmeldingswrapper}>
      {aktiveArbeidsforhold().map((forhold, forholdsindex) => (
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
              egenmeldingsperioder?.[forhold.arbeidsforholdId].map((egenmeldingsperiode, index) => {
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
                        value={formatIsoDate(egenmeldingsperiode.fra)}
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
                        value={formatIsoDate(egenmeldingsperiode.til)}
                      />
                    </div>
                    {index === 0 && forholdsindex === 0 && (
                      <div className={localStyles.sammeperiode}>
                        <Checkbox
                          onChange={(event) =>
                            setSammeEgenmeldingsperiodeArbeidsforhold(
                              forhold.arbeidsforholdId,
                              event.currentTarget.checked
                            )
                          }
                          checked={sammeEgenmeldingsperiode}
                        >
                          {flereEnnToArbeidsforhold && <>Bruk samme for de andre arbeidsforholdene</>}
                          {!flereEnnToArbeidsforhold && <>Bruk samme for det andre arbeidsforholdet</>}
                        </Checkbox>
                      </div>
                    )}
                    {index > 0 && (
                      <div className={styles.endresykemelding}>
                        <ButtonSlette
                          onClick={() => slettEgenmeldingsperiode(egenmeldingsperiode.id)}
                          title='Slett egenmeldingsperiode'
                        />
                      </div>
                    )}
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
