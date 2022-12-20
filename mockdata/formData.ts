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
  sammeFravaersperiode: false
};

const formData = {
  ...initialState,
  navn: 'Navn Navnesen',
  identitetsnummer: testFnr.GyldigeFraDolly.TestPerson1,
  orgnrUnderenhet: '911206722',
  bruttoinntekt: 77000,
  fravaersperioder: [
    {
      fom: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
      tom: format(subDays(new Date(), 3), 'yyyy-MM-dd')
    },
    {
      fom: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      tom: format(subDays(new Date(), 0), 'yyyy-MM-dd')
    }
  ],
  egenmeldingsperioder: [
    {
      fom: format(subDays(new Date(), 18), 'yyyy-MM-dd'),
      tom: format(subDays(new Date(), 15), 'yyyy-MM-dd')
    }
  ],
  tidligereinntekter: [
    // Hva skjer ved jobbskifte?
    {
      maanedsnavn: format(subDays(new Date(), 33), 'yyyy-MM'), // yyyy-MM
      inntekt: 88000
    },
    {
      maanedsnavn: format(subDays(new Date(), 66), 'yyyy-MM'), // yyyy-MM
      inntekt: 66000
    },
    {
      maanedsnavn: format(subDays(new Date(), 99), 'yyyy-MM'), // yyyy-MM
      inntekt: 88000
    }
  ]
  //  behandlingsdager: ['2022-01-01'],
  // behandlingsperiode: {
  //   fom: '2022-01-01',
  //   tom: '2022-06-02'
  // }
};

export default formData;
