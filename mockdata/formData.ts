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
  fravaersperiode: [
    {
      fra: format(subDays(new Date(), 180), 'yyyy-MM-dd'),
      til: format(subDays(new Date(), 4), 'yyyy-MM-dd')
    },
    {
      fra: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
      til: format(subDays(new Date(), 1), 'yyyy-MM-dd')
    }
  ],
  // fravaersperiode: [
  //   {
  //     fra: format(subDays(new Date(), 11), 'yyyy-MM-dd'),
  //     til: format(subDays(new Date(), 4), 'yyyy-MM-dd')
  //   },
  //   {
  //     fra: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
  //     til: format(subDays(new Date(), 1), 'yyyy-MM-dd')
  //   }
  // ],
  tidligereinntekt: [
    {
      maanedsnavn: 'Februar',
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
  behandlingsdager: true
};

export default formData;
