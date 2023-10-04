import MottattData from '../state/MottattData';
import testFnr from './testFnr';

const formData: Partial<MottattData> = {
  innsenderNavn: 'Test Testesen',
  telefonnummer: '12345678',
  navn: 'ULTRAFIOLETT DAMESYKKEL',
  orgNavn: 'ANSTENDIG PIGGSVIN BARNEHAGE',
  identitetsnummer: '10486535275',
  orgnrUnderenhet: '810007842',
  fravaersperioder: [
    { fom: '2023-08-28', tom: '2023-09-10' },
    { fom: '2023-09-11', tom: '2023-09-24' }
  ],
  egenmeldingsperioder: [],
  bruttoinntekt: 20344.84,
  tidligereinntekter: [
    { maaned: '2023-05', inntekt: 16841.76 },
    { maaned: '2023-06', inntekt: 25813.77 },
    { maaned: '2023-07', inntekt: 18379.0 }
  ],
  behandlingsperiode: null,
  behandlingsdager: [],
  forespurtData: {
    arbeidsgiverperiode: { paakrevd: true },
    inntekt: {
      paakrevd: true,
      forslag: {
        type: 'ForslagInntektGrunnlag',
        beregningsmaaneder: ['2023-03', '2023-04', '2023-05'],
        forrigeInntekt: { skjæringstidspunkt: '2023-03-17', kilde: 'INNTEKTSMELDING', beløp: 21781.0 }
      }
    },
    refusjon: {
      paakrevd: true,
      forslag: { perioder: [{ fom: '2023-03-17', beloep: 0.0 }], opphoersdato: null }
    }
  }
};

export default formData;
