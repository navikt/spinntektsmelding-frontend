import InntektsmeldingSkjema from '../state/state';
import testFnr from './testFnr';

const initialState: InntektsmeldingSkjema = {
  opplysningerBekreftet: false,
  egenmeldingsperioder: [],
  bruttoinntekt: {
    bruttoInntekt: 0,
    manueltKorrigert: false,
    endringsaarsak: ''
  },
  opprinneligbruttoinntekt: {
    bruttoInntekt: 0,
    manueltKorrigert: false,
    endringsaarsak: ''
  },
  sammeFravaersperiode: false,
  innsenderNavn: undefined,
  innsenderTelefonNr: undefined,
  aarsakInnsending: 'Ny'
};

const formData = {
  ...initialState,
  navn: 'Test Navn Testesen-Navnesen Jr.',
  identitetsnummer: testFnr.GyldigeFraDolly.TestPerson1,
  orgnrUnderenhet: '911206722',
  orgNavn: 'Veldig ampert piggsvin barnehage',
  bruttoinntekt: 77000,

  fravaersperioder: [
    {
      fom: '2023-02-20',
      tom: '2023-03-03'
    },
    {
      fom: '2023-03-05',
      tom: '2023-03-06'
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
      maaned: '2022-11', // yyyy-MM
      inntekt: 88000
    }
  ],
  innsenderNavn: 'Test Testesen',
  innsenderTelefonNr: '12345678',
  // behandlingsdager: ['2022-01-10'],
  // behandlingsperiode: {
  //   fom: new Date(), 4),
  //   tom: subMonths(new Date(), 10)
  // }
  // feilReport: [
  //   {
  //     melding: 'Klarer ikke hente informasjon om virksomheten',
  //     status: 0,
  //     datafelt: 'virksomhet'
  //   },
  //   {
  //     melding: 'Klarer ikke hente informasjon om den ansatte',
  //     status: 0,
  //     datafelt: 'arbeidstaker-informasjon'
  //   },
  //   {
  //     melding: 'Klarer ikke hente informasjon om virksomheten',
  //     status: 0,
  //     datafelt: 'inntekt'
  //   }
  // ]
  feilReport: {
    feil: [
      {
        melding: 'Vi klarte ikke å hente arbeidstaker informasjon.',
        datafelt: 'arbeidstaker-informasjon'
      }
    ]
  }
};

export default formData;
