import localStyles from './FaisuKvittering.module.css';

type FaisuArbeidsforhold = {
  arbeidsforholdId: string;
  yrkestittel?: string;
  maanedsloenn?: number;
  stillingsprosent?: number;
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
          <th>Yrkestittel</th>
          <th>Månedslønn</th>
          <th>Stillingsprosent</th>
        </tr>
      </thead>
      <tbody>
        {arbeidsforhold.map((forhold) => {
          return (
            <tr key={forhold.arbeidsforholdId}>
              <td>{forhold.yrkestittel}</td>
              <td>{forhold.maanedsloenn}</td>
              <td>{forhold.stillingsprosent} %</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
