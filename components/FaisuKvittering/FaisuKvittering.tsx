import { Fragment } from 'react/jsx-runtime';
import formatCurrency from '../../utils/formatCurrency';
import localStyles from './FaisuKvittering.module.css';
import { Table } from '@navikt/ds-react';
import parseIsoDate from '../../utils/parseIsoDate';
import formatDate from '../../utils/formatDate';

type FaisuArbeidsforhold = {
  yrkesbeskrivelse?: string;
  inntekt?: number;
  stillingsprosent?: number;
  inkludertISykefravaer?: boolean;
};

type FlereArbeidsforhold = {
  harLikLoenn: boolean;
  erSykmeldtFraAlle: boolean;
  arbeidsforholdPerSykmeldingStartdato?: FaisuArbeidsforhold[];
};

type FaisuKvitteringProps = {
  arbeidsforhold?: FlereArbeidsforhold;
};

export default function FaisuKvittering({ arbeidsforhold }: Readonly<FaisuKvitteringProps>) {
  console.log('FaisuKvittering - arbeidsforhold:', arbeidsforhold);
  if (!arbeidsforhold?.arbeidsforholdPerSykmeldingStartdato) {
    return null;
  }

  const keys = Object.keys(arbeidsforhold.arbeidsforholdPerSykmeldingStartdato);
  if (keys.length === 0) {
    return null;
  }
  // arbeidsforhold.arbeidsforholdPerSykmeldingStartdato
  return (
    <Table className={localStyles.table}>
      <tbody>
        {keys.map((key, index) => {
          const perioder = arbeidsforhold.arbeidsforholdPerSykmeldingStartdato[key];
          console.log(`FaisuKvittering - arbeidsforhold for startdato ${parseIsoDate(key)}:`, perioder);
          if (!perioder || perioder.length === 0) {
            return null;
          }
          return (
            <Fragment key={key}>
              <Table.Row>
                <Table.HeaderCell scope='row'>Sykmelding startdato {formatDate(parseIsoDate(key))}</Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell>Syk</Table.HeaderCell>
                <Table.HeaderCell>Yrkestittel</Table.HeaderCell>
                <Table.HeaderCell>Månedslønn</Table.HeaderCell>
                <Table.HeaderCell>Stillingsprosent</Table.HeaderCell>
              </Table.Row>
              {perioder.map((forhold, forholdindex) => (
                <Table.Row key={'fk' + index + '-' + forholdindex}>
                  <Table.DataCell>{forhold.inkludertISykefravaer ? 'Ja' : 'Nei'}</Table.DataCell>
                  <Table.DataCell>{forhold.yrkesbeskrivelse}</Table.DataCell>
                  <Table.DataCell>{formatCurrency(forhold.inntekt)}</Table.DataCell>
                  <Table.DataCell>{forhold.stillingsprosent} %</Table.DataCell>
                </Table.Row>
              ))}
            </Fragment>
          );
        })}
      </tbody>
    </Table>
  );
}
