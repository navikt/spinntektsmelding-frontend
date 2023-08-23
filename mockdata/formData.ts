import MottattData from '../state/MottattData';
import testFnr from './testFnr';

const formData: Partial<MottattData> = {
  navn: 'ULTRAFIOLETT DAMESYKKEL',
  orgNavn: 'ANSTENDIG PIGGSVIN BARNEHAGE',
  identitetsnummer: '10486535275',
  orgnrUnderenhet: '810007842',
  fravaersperioder: [
    { fom: '2023-05-01', tom: '2023-05-31' },
    { fom: '2023-06-10', tom: '2023-06-30' }
  ],
  egenmeldingsperioder: [],
  bruttoinntekt: 45000.0,
  tidligereinntekter: [
    { maaned: '2023-04', inntekt: 45000.0 },
    { maaned: '2023-03', inntekt: 45000.0 }
  ],
  behandlingsperiode: null,
  behandlingsdager: [],
  forespurtData: {
    arbeidsgiverperiode: { paakrevd: false },
    inntekt: {
      paakrevd: true,
      forslag: {
        type: 'ForslagInntektGrunnlag',
        beregningsmaaneder: ['2023-03', '2023-04', '2023-05'],
        forrigeInntekt: { skjæringstidspunkt: '2023-05-01', kilde: 'INNTEKTSMELDING', beløp: 33750.0 }
      }
    },
    refusjon: {
      paakrevd: true,
      forslag: {
        perioder: [
          { fom: '2023-05-01', beloep: 33750.0 },
          { fom: '2023-08-08', beloep: 0 }
        ],
        opphoersdato: null
      }
    }
  }
};

export default formData;
