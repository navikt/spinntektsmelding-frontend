import MottattData from '../state/MottattData';
import testFnr from './testFnr';

const formData: Partial<MottattData> = {
  navn: 'ULTRAFIOLETT DAMESYKKEL',
  orgNavn: 'ANSTENDIG PIGGSVIN BARNEHAGE',
  identitetsnummer: '10486535275',
  orgnrUnderenhet: '810007842',
  fravaersperioder: [
    { fom: '2023-09-04', tom: '2023-09-10' },
    { fom: '2023-09-11', tom: '2023-09-24' }
  ],
  egenmeldingsperioder: [],
  bruttoinntekt: 45000.0,
  tidligereinntekter: [
    { maaned: '2023-07', inntekt: 45000.0 },
    { maaned: '2023-06', inntekt: 45000.0 },
    { maaned: '2023-05', inntekt: 45000.0 }
  ],
  behandlingsperiode: null,
  behandlingsdager: [],
  forespurtData: {
    arbeidsgiverperiode: { paakrevd: true },
    inntekt: {
      paakrevd: true,
      forslag: {
        type: 'ForslagInntektGrunnlag',
        beregningsmaaneder: ['2023-05', '2023-06', '2023-07'],
        forrigeInntekt: { skjæringstidspunkt: '2023-08-28', kilde: 'INNTEKTSMELDING', beløp: 33750.0 }
      }
    },
    refusjon: {
      paakrevd: true,
      forslag: {
        perioder: [],
        opphoersdato: null
      }
    }
  }
};

export default formData;
