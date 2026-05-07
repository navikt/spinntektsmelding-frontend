import localStyles from './FaisuKvittering.module.css';

type FaisuArbeidsforhold = {
  yrkesbeskrivelse?: string;
  inntekt?: number;
  stillingsprosent?: number;
  inkludertISykefravaer?: boolean;
};

type FaisuKvitteringProps = {
  harLikLoenn: boolean;
  erSykmeldtFraAlle: boolean;
  arbeidsforhold?: FaisuArbeidsforhold[];
};

export default function FaisuKvittering({ arbeidsforhold }: Readonly<FaisuKvitteringProps | null>) {
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
        {arbeidsforhold.arbeidsforhold.map((forhold, index) => {
          return (
            <tr key={'fk' + index}>
              <td>{forhold.inkludertISykefravaer ? 'Ja' : 'Nei'}</td>
              <td>{forhold.yrkesbeskrivelse}</td>
              <td>{forhold.inntekt}</td>
              <td>{forhold.stillingsprosent} %</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
