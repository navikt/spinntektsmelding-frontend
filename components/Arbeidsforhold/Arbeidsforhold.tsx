import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { IArbeidsforhold } from '../../state/state';
import useArbeidsforholdStore from '../../state/useArbeidsforholdStore';
import localStyle from './Arbeidsforhold.module.css';

export default function Arbeidsforhold() {
  const arbeidsforhold: Array<IArbeidsforhold> | undefined = useArbeidsforholdStore((state) => state.arbeidsforhold);
  const afgroupId = arbeidsforhold
    ? arbeidsforhold.filter((forhold) => forhold.aktiv).map((forhold) => forhold.arbeidsforholdId)
    : [];
  const setAktiveArbeidsforhold = useArbeidsforholdStore((store) => store.setAktiveArbeidsforhold);

  return (
    <div>
      <CheckboxGroup onChange={setAktiveArbeidsforhold} legend='Arbeidsforhold' value={afgroupId}>
        <table>
          <thead>
            <tr>
              <th>
                <div className={localStyle.checktitle}>Velg</div>
                <div className={localStyle.idtitle}>Arbeidsforhold</div>
              </th>
              <th>
                <div className={localStyle.idtitle}>ArbeidsforholdId</div>
              </th>
              <th className={localStyle.prosenttitle}>Stillingsprosent</th>
            </tr>
          </thead>
          <tbody>
            {arbeidsforhold &&
              arbeidsforhold.map((forhold) => (
                <tr key={forhold.arbeidsforholdId}>
                  <td className={localStyle.check}>
                    <Checkbox value={forhold.arbeidsforholdId}>
                      <div className={localStyle.arbeidsforhold}>{forhold.arbeidsforhold}</div>
                    </Checkbox>
                  </td>
                  <td>{forhold.arbeidsforholdId}</td>
                  <td>{forhold.stillingsprosent}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </CheckboxGroup>
    </div>
  );
}
