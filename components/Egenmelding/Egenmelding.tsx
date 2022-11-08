import { BodyLong, Button, Checkbox } from '@navikt/ds-react';
import styles from '../../styles/Home.module.css';
import localStyles from './Egenmelding.module.css';
import ButtonSlette from '../ButtonSlette/ButtonSlette';
import Heading3 from '../Heading3/Heading3';
import useBoundStore from '../../state/useBoundStore';
import EgenmeldingPeriode from './EgenmeldingPeriode';

export default function Egenmelding() {
  const arbeidsforhold = useBoundStore((state) => state.arbeidsforhold);
  const flereArbeidsforhold = arbeidsforhold && arbeidsforhold.length > 1;
  const aktiveArbeidsforhold = useBoundStore((state) => state.aktiveArbeidsforhold);
  const egenmeldingsperioder = useBoundStore((state) => state.egenmeldingsperioder);
  const slettEgenmeldingsperiode = useBoundStore((state) => state.slettEgenmeldingsperiode);
  const leggTilEgenmeldingsperiode = useBoundStore((state) => state.leggTilEgenmeldingsperiode);
  const setSammeEgenmeldingsperiodeArbeidsforhold = useBoundStore(
    (state) => state.setSammeEgenmeldingsperiodeArbeidsforhold
  );
  const sammeEgenmeldingsperiode = useBoundStore((state) => state.sammeEgenmeldingsperiode);
  const flereEnnToArbeidsforhold: boolean = !!arbeidsforhold && arbeidsforhold.length > 2;

  return (
    <div className={localStyles.egenmeldingswrapper}>
      <Heading3>Eventuell egenmelding</Heading3>
      <BodyLong>
        Dersom den ansatte var fraværende med egenmelding frem til sykmeldingen ble utstedt skal du oppgi første
        fraværsdag med egenmelding i dette feltet.
      </BodyLong>
      {aktiveArbeidsforhold().map((forhold, forholdsindex) => (
        <div key={forhold.arbeidsforholdId}>
          {flereArbeidsforhold && (
            <Heading3>Eventuell egenmelding {flereArbeidsforhold ? ` - ${forhold.arbeidsforhold}` : ''}</Heading3>
          )}

          <div className={localStyles.egenmeldingswrapper}>
            {egenmeldingsperioder?.[forhold.arbeidsforholdId] &&
              egenmeldingsperioder?.[forhold.arbeidsforholdId].map((egenmeldingsperiode, index) => {
                return (
                  <div key={egenmeldingsperiode.id} className={styles.periodewrapper}>
                    <EgenmeldingPeriode periodeId={egenmeldingsperiode.id} egenmeldingsperiode={egenmeldingsperiode} />
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
