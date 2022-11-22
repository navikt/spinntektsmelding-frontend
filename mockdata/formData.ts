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
  bruttoinntekt: 77000,
  // behandlingsperiode: {
  //   fra: format(subDays(new Date(), 180), 'yyyy-MM-dd'),
  //   til: format(subDays(new Date(), 4), 'yyyy-MM-dd')
  // },
  fravaersperioder: [
    {
      fra: format(subDays(new Date(), 11), 'yyyy-MM-dd'),
      til: format(subDays(new Date(), 6), 'yyyy-MM-dd')
    },
    {
      fra: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
      til: format(subDays(new Date(), 1), 'yyyy-MM-dd')
    }
  ],
  egenmeldingsperioder: [
    {
      fra: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
      til: format(subDays(new Date(), 11), 'yyyy-MM-dd')
    }
  ],
  tidligereinntekt: [
    {
      maanedsnavn: 'Februar', // yyyy-MM
      inntekt: 88000
    },
    {
      maanedsnavn: 'Mars',
      inntekt: 66000
    },
    {
      maanedsnavn: 'April',
      inntekt: 88000
    }
  ],
  behandlingsdager: ['2022-01-01'],
  behandlingsperiode: {
    fra: '2022-01-01',
    til: '2022-06-02'
  }
};

export default formData;
