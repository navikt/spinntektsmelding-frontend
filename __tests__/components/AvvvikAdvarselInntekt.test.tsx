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
    render(<AvvikAdvarselInntekt tidligereInntekter={[]} />);
    expect(screen.getByText(/Angi bruttoinntekt/)).toBeInTheDocument();
  });

  it('renders warning alert when there are manglendeEller0FraAmeldingen', () => {
    const tidligereInntekter: Array<HistoriskInntekt> = [
      { maaned: '2023-01', inntekt: null },
      { maaned: '2023-02', inntekt: null },
      { maaned: '2023-03', inntekt: null }
    ];
    render(<AvvikAdvarselInntekt tidligereInntekter={tidligereInntekter} />);
    expect(screen.getByText(/Lønnsopplysningene inneholder måneder uten rapportert inntekt/)).toBeInTheDocument();
  });

  it('renders warning alert when there are feriemaaneder', () => {
    const tidligereInntekter: Array<HistoriskInntekt> = [
      { maaned: '2023-05', inntekt: 12028.25 },
      { maaned: '2023-06', inntekt: 11730.69 },
      { maaned: '2023-07', inntekt: 17659.88 }
    ];

    render(<AvvikAdvarselInntekt tidligereInntekter={tidligereInntekter} />);
    expect(screen.getByText(/Lønnsopplysningene kan inneholde feriepenger/)).toBeInTheDocument();
  });
});
