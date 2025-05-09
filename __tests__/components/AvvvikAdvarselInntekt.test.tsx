import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvvikAdvarselInntekt from '../../components/AvvikAdvarselInntekt/AvvikAdvarselInntekt';
import { HistoriskInntekt } from '../../schema/historiskInntektSchema';

describe('AvvikAdvarselInntekt', () => {
  it('renders null when there are no tidligereInntekter', () => {
    render(<AvvikAdvarselInntekt />);
    expect(screen.queryByText(/Angi bruttoinntekt/)).not.toBeInTheDocument();
  });

  it('renders BodyLong when there are no tidligereInntekter', () => {
    render(<AvvikAdvarselInntekt tidligereInntekter={new Map([])} />);
    expect(screen.getByText(/Angi bruttoinntekt/)).toBeInTheDocument();
  });

  it('renders warning alert when there are manglendeEller0FraAmeldingen', () => {
    const tidligereInntekter: HistoriskInntekt = new Map([
      ['2023-01', null],
      ['2023-02', null],
      ['2023-03', null]
    ]);
    render(<AvvikAdvarselInntekt tidligereInntekter={tidligereInntekter} />);
    expect(screen.getByText(/Lønnsopplysningene inneholder måneder uten rapportert inntekt/)).toBeInTheDocument();
  });

  it('renders warning alert when there are feriemaaneder', () => {
    const tidligereInntekter: HistoriskInntekt = new Map([
      ['2023-05', 12028.25],
      ['2023-06', 11730.69],
      ['2023-07', 17659.88]
    ]);

    render(<AvvikAdvarselInntekt tidligereInntekter={tidligereInntekter} />);
    expect(screen.getByText(/Lønnsopplysningene kan inneholde feriepenger/)).toBeInTheDocument();
  });
});
