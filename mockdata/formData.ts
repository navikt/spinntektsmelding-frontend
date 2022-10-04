// import { format, subDays } from 'date-fns';
// import { nanoid } from 'nanoid';
// import InntektsmeldingSkjema from '../state/state';

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
//   // behandlingsdager: ['2022-01-01'],
//   // behandlingsperiode: {
//   //   fra: '2022-01-01',
//   //   til: '2022-01-02'
//   // },
//   arbeidsforhold: [
//     {
//       arbeidsforholdId: '1',
//       arbeidsforhold: 'test',
//       stillingsprosent: 100
//     }
//   ]
// };

/*******************************/

const formData = {
  navn: 'Ola Normann',
  identitetsnummer: '10107400090',
  virksomhetsnavn: 'Norge AS',
  orgnrUnderenhet: '810007842',
  fravaersperiode: {
    '1': {
      fra: '2022-01-01',
      til: '2022-01-02'
    }
  },
  egenmeldingsperioder: [
    {
      fra: '2022-01-01',
      til: '2022-01-02'
    }
  ],
  bruttoinntekt: 1000,
  tidligereinntekt: [
    {
      maanedsnavn: 'Januar',
      inntekt: 1
    }
  ],
  behandlingsdager: ['2022-01-01'],
  behandlingsperiode: {
    fra: '2022-01-01',
    til: '2022-01-02'
  },
  arbeidsforhold: [
    {
      arbeidsforholdId: '1',
      arbeidsforhold: 'test',
      stillingsprosent: 100
    }
  ]
};

export default formData;
