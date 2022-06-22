import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { IArbeidsforhold } from '../../state/state';
import localStyle from './Arbeidsforhold.module.css';

interface ArbeidsforholdProps {
  arbeidsforhold: Array<IArbeidsforhold>;
  onChangeArbeidsforhold: (value: any[]) => void;
}

export default function Arbeidsforhold({ arbeidsforhold, onChangeArbeidsforhold }: ArbeidsforholdProps) {
  const isChecked = (forholdsId: string): boolean => {
    return Boolean(arbeidsforhold.find((forhold) => forhold.arbeidsforholdId === forholdsId)?.aktiv === true);
  };
  //  checked={isChecked(forhold.arbeidsforholdId)}
  const afgroupId = arbeidsforhold.map((forhold) => forhold.arbeidsforholdId);

  return (
    <div>
      <CheckboxGroup onChange={onChangeArbeidsforhold} legend='Arbeidsforhold' value={afgroupId}>
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
            {arbeidsforhold.map((forhold) => (
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
