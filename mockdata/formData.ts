// import { format, subDays } from 'date-fns';
// import { nanoid } from 'nanoid';
// import InntektsmeldingSkjema from '../state/state';

import { format, subDays } from 'date-fns';
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
//         fra: '2022-01-01',
//         til: '2022-01-02'
//       }
//     ]
//   },
//   egenmeldingsperioder: [
//     {
//       fra: '2022-01-01',
//       til: '2022-01-02'
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
//     fra: '2022-01-01',
//     til: '2022-06-02'
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
//       fra: '2022-01-01',
//       til: '2022-01-02'
//     }
//   },
//   egenmeldingsperioder: [
//     {
//       fra: '2022-01-01',
//       til: '2022-01-02'
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
//     fra: '2022-01-01',
//     til: '2022-01-02'
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
  egenmeldingsperioder: { ukjent: [{ id: nanoid() }] },
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
  sammeFravaersperiode: false
};

const formData = {
  ...initialState,
  navn: 'Navn Navnesen',
  identitetsnummer: testFnr.GyldigeFraDolly.TestPerson1,
  orgnrUnderenhet: '911206722',
  bruttoinntekt: 44000,
  // behandlingsperiode: {
  //   fra: format(subDays(new Date(), 180), 'yyyy-MM-dd'),
  //   til: format(subDays(new Date(), 4), 'yyyy-MM-dd')
  // },
  fravaersperiode: {
    spillerid: [
      {
        fra: format(subDays(new Date(), 11), 'yyyy-MM-dd'),
        til: format(subDays(new Date(), 4), 'yyyy-MM-dd')
      },
      {
        fra: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
        til: format(subDays(new Date(), 1), 'yyyy-MM-dd')
      }
    ],
    trenerid: [
      {
        fra: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
        til: format(subDays(new Date(), 5), 'yyyy-MM-dd')
      },
      {
        fra: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        til: format(subDays(new Date(), 2), 'yyyy-MM-dd')
      }
    ],
    vaktmesterid: [
      {
        fra: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
        til: format(subDays(new Date(), 5), 'yyyy-MM-dd')
      },
      {
        fra: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        til: format(subDays(new Date(), 2), 'yyyy-MM-dd')
      }
    ]
  },
  tidligereinntekt: [
    {
      maanedsnavn: 'Februar', // yyyy-MM
      inntekt: 55000
    },
    {
      maanedsnavn: 'Mars',
      inntekt: 9000
    },
    {
      maanedsnavn: 'April',
      inntekt: 55000
    }
  ],
  behandlingsdager: ['2022-01-01'],
  behandlingsperiode: {
    fra: '2022-01-01',
    til: '2022-06-02'
  },
  arbeidsforhold: [
    {
      arbeidsforholdId: 'spillerid',
      arbeidsforhold: 'Spiller',
      stillingsprosent: 50
    },
    {
      arbeidsforholdId: 'trenerid',
      arbeidsforhold: 'Trener',
      stillingsprosent: 40
    },
    {
      arbeidsforholdId: 'vaktmesterid',
      arbeidsforhold: 'Vaktmester',
      stillingsprosent: 10
    }
  ]
};

export default formData;
