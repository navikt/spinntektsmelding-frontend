import localStyles from './FaisuKvittering.module.css';

type FaisuArbeidsforhold = {
  arbeidsforholdId: string;
  yrkesBeskrivelse?: string;
  maanedsloenn?: number;
  stillingsprosent?: number;
  aktivtSykefravaer?: boolean;
};

type FaisuKvitteringProps = {
  arbeidsforhold?: FaisuArbeidsforhold[];
};

export default function FaisuKvittering({ arbeidsforhold }: Readonly<FaisuKvitteringProps>) {
  if (!arbeidsforhold) {
    return null;
  }

  return (
    <table className={localStyles.table}>
      <thead>
        <tr>
          <th>Syk</th>
          <th>Yrkestittel</th>
          <th>Månedslønn</th>
          <th>Stillingsprosent</th>
        </tr>
      </thead>
      <tbody>
        {arbeidsforhold.map((forhold, index) => {
          return (
            <tr key={'fk' + index}>
              <td>{forhold.aktivtSykefravaer ? 'Ja' : 'Nei'}</td>
              <td>{forhold.yrkesBeskrivelse}</td>
              <td>{forhold.maanedsloenn}</td>
              <td>{forhold.stillingsprosent} %</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
