import { format, subDays } from 'date-fns';
import { initialState } from '../state/formReducer';
import testFnr from './testFnr';
import testOrg from './testOrganisasjoner';

const formData = {
  ...initialState,
  navn: 'Navn Navnesen',
  identitetsnummer: testFnr.GyldigeFraDolly.TestPerson1,
  orgnrUnderenhet: testOrg[5].OrganizationNumber,
  bruttoinntekt: 44000,
  // fravaersperiode: [
  //   {
  //     fra: format(subDays(new Date(), 180), 'yyyy-MM-dd'),
  //     til: format(subDays(new Date(), 4), 'yyyy-MM-dd')
  //   },
  //   {
  //     fra: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
  //     til: format(subDays(new Date(), 1), 'yyyy-MM-dd')
  //   }
  // ],
  // behandlingsdager: true,
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
  behandlingsdager: false,
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
