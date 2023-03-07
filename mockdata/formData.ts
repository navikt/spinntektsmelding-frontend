// import { format, subDays } from 'date-fns';
// import { nanoid } from 'nanoid';
// import InntektsmeldingSkjema from '../state/state';

import { format, subDays, subMonths } from 'date-fns';
import { nanoid } from 'nanoid';
import InntektsmeldingSkjema from '../state/state';
import testFnr from './testFnr';

// import testFnr from './testFnr';
// import testOrg from './testOrganisasjoner';

// const initialState: InntektsmeldingSkjema = {
//   opplysningerBekreftet: false,
//   egenmeldingsperioder: { ukjent: [{ id: nanoid() }] },
//   bruttoinntekt: {
//     bruttoInntekt: 0,
//     bekreftet: false,
//     manueltKorrigert: false,
//     endringsaarsak: ''
//   },
//   opprinneligbruttoinntekt: {
//     bruttoInntekt: 0,
//     bekreftet: false,
//     manueltKorrigert: false,
//     endringsaarsak: ''
//   },
//   sammeFravaersperiode: false
// };

/***************************************** */

// const formData = {
//   navn: 'Ola Normann',
//   identitetsnummer: '10107400090',
//   virksomhetsnavn: 'Norge AS',
//   orgnrUnderenhet: '810007842',
//   fravaersperiode: {
//     '1': [
//       {
//         fom: '2022-01-01',
//         tom: '2022-01-02'
//       }
//     ]
//   },
//   egenmeldingsperioder: [
//     {
//       fom: '2022-01-01',
//       tom: '2022-01-02'
//     }
//   ],
//   bruttoinntekt: 1000,
//   tidligereinntekt: [
//     {
//       maanedsnavn: 'Januar',
//       inntekt: 1
//     }
//   ],
//   behandlingsdager: ['2022-01-01'],
//   behandlingsperiode: {
//     fom: '2022-01-01',
//     tom: '2022-06-02'
//   },
//   arbeidsforhold: [
//     {
//       arbeidsforholdId: '1',
//       arbeidsforhold: 'test',
//       stillingsprosent: 100
//     }
//   ]
// };

/*******************************/

// const formData = {
//   navn: 'Ola Normann',
//   identitetsnummer: '10107400090',
//   virksomhetsnavn: 'Norge AS',
//   orgnrUnderenhet: '810007842',
//   fravaersperiode: {
//     '1': {
//       fom: '2022-01-01',
//       tom: '2022-01-02'
//     }
//   },
//   egenmeldingsperioder: [
//     {
//       fom: '2022-01-01',
//       tom: '2022-01-02'
//     }
//   ],
//   bruttoinntekt: 1000,
//   tidligereinntekt: [
//     {
//       maanedsnavn: 'Januar',
//       inntekt: 1
//     }
//   ],
//   behandlingsdager: ['2022-01-01'],
//   behandlingsperiode: {
//     fom: '2022-01-01',
//     tom: '2022-01-02'
//   },
//   arbeidsforhold: [
//     {
//       arbeidsforholdId: '1',
//       arbeidsforhold: 'test',
//       stillingsprosent: 100
//     }
//   ]
// };

/*******************************/

const initialState: InntektsmeldingSkjema = {
  opplysningerBekreftet: false,
  egenmeldingsperioder: [{ id: nanoid() }],
  bruttoinntekt: {
    bruttoInntekt: 0,
    bekreftet: false,
    manueltKorrigert: false,
    endringsaarsak: ''
  },
  opprinneligbruttoinntekt: {
    bruttoInntekt: 0,
    bekreftet: false,
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
  navn: 'Navn Navnesen',
  identitetsnummer: testFnr.GyldigeFraDolly.TestPerson1,
  orgnrUnderenhet: '911206722',
  orgNavn: 'Ampert piggsvin barnehage',
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
    //   {
    //     fom: format(subDays(new Date(), 18), 'yyyy-MM-dd'),
    //     tom: format(subDays(new Date(), 15), 'yyyy-MM-dd')
    //   }
  ],
  tidligereinntekter: [
    // Hva skjer ved jobbskifte?
    {
      maanedsnavn: '2023-02', // yyyy-MM
      inntekt: 88000
    },
    {
      maanedsnavn: '2023-01', // yyyy-MM
      inntekt: 88000
    },
    {
      maanedsnavn: '2022-12', // yyyy-MM
      inntekt: 88000
    },
    {
      maanedsnavn: '2022-11', // yyyy-MM
      inntekt: 66000
    },
    {
      maanedsnavn: '2022-10', // yyyy-MM
      inntekt: 88000
    },
    {
      maanedsnavn: '2022-09', // yyyy-MM
      inntekt: 88000
    },
    {
      maanedsnavn: '2022-08', // yyyy-MM
      inntekt: 88000
    },
    {
      maanedsnavn: '2022-07', // yyyy-MM
      inntekt: 88000
    },
    {
      maanedsnavn: '2022-06', // yyyy-MM
      inntekt: 88000
    }
  ],
  innsenderNavn: 'Test Testesen',
  innsenderTelefonNr: '12345678'
  // behandlingsdager: ['2022-01-10'],
  // behandlingsperiode: {
  //   fom: new Date(), 4),
  //   tom: subMonths(new Date(), 10)
  // }
};

export default formData;
