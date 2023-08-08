import MottattData from 'state/MottattData';
import testFnr from './testFnr';

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
  innsenderTelefonNr: '12345678'
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
