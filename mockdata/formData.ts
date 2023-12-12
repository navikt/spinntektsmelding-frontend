import MottattData from '../state/MottattData';
import testFnr from './testFnr';

import trengerDelvis from './trenger-delvis.json';

// const formData = trengerDelvis as MottattData;

const formData: Partial<MottattData> = {
  // behandlingsdager: [],
  // behandlingsperiode: {
  //   fom: '2022-02-20',
  //   tom: '2022-08-03'
  // },
  navn: 'Test Navn Testesen-Navnesen Jr.',
  identitetsnummer: testFnr.GyldigeFraDolly.TestPerson1,
  orgnrUnderenhet: '911206722',
  orgNavn: 'Veldig ampert piggsvin barnehage',
  bruttoinntekt: 77000,

  fravaersperioder: [
    {
      fom: '2023-02-20',
      tom: '2023-03-01'
    },
    {
      fom: '2023-03-15',
      tom: '2023-03-16'
    }
  ],
  egenmeldingsperioder: [
    {
      fom: '2023-02-17',
      tom: '2023-02-19'
    }
  ],
  tidligereinntekter: [
    // Hva skjer ved jobbskifte?
    {
      maaned: '2023-01', // yyyy-MM
      inntekt: 66000
    },
    {
      maaned: '2022-12', // yyyy-MM
      inntekt: 88000
    },
    {
      maaned: '2023-02', // yyyy-MM
      inntekt: 88000
    }
  ],
  innsenderNavn: 'Test Testesen',
  telefonnummer: '12345678',
  behandlingsperiode: null,
  behandlingsdager: [],
  forespurtData: {
    arbeidsgiverperiode: { paakrevd: true },
    inntekt: {
      paakrevd: true,
      forslag: {
        type: 'ForslagInntektGrunnlag',
        beregningsmaaneder: ['2022-12', '2023-01', '2023-02'],
        forrigeInntekt: {
          skjæringstidspunkt: '2023-03-15',
          kilde: 'INNTEKTSMELDING',
          beløp: 77500.0
        }
      }
    },
    refusjon: {
      paakrevd: true,
      forslag: {
        perioder: [
          { fom: '2023-02-01', tom: '2023-03-01', beløp: 66000 },
          { fom: '2023-03-02', tom: '2023-04-01', beløp: 55000 },
          { fom: '2023-05-02', tom: '2023-05-02', beløp: 44000 }
        ],
        opphoersdato: null
        //refundert: 76000
      }
    }
  }
  // feilReport: {
  //   feil: [
  //     {
  //       melding: 'Vi klarte ikke å hente arbeidstaker informasjon.',
  //       status: 0,
  //       datafelt: 'arbeidstaker-informasjon'
  //     },
  //     {
  //       melding: 'Klarer ikke hente informasjon om virksomheten',
  //       status: 0,
  //       datafelt: 'virksomhet'
  //     },
  //     {
  //       melding: 'Klarer ikke hente informasjon om virksomheten',
  //       status: 0,
  //       datafelt: 'inntekt'
  //     }
  //   ]
  // }
};

export default formData;
