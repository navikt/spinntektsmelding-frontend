import { Organisasjon } from '@navikt/bedriftsmeny/lib/organisasjon';

const testOrganisasjoner: Organisasjon[] = [
  {
    Name: 'ANSTENDIG BJØRN KOMMUNE',
    Type: 'Enterprise',
    ParentOrganizationNumber: '',
    OrganizationForm: 'KOMM',
    OrganizationNumber: '810007672',
    Status: 'Active'
  },
  {
    Name: 'ANSTENDIG PIGGSVIN BRANNVESEN',
    Type: 'Business',
    ParentOrganizationNumber: '810007702',
    OrganizationForm: 'BEDR',
    OrganizationNumber: '810008032',
    Status: 'Active'
  },
  {
    Name: 'ANSTENDIG PIGGSVIN BARNEHAGE',
    Type: 'Business',
    ParentOrganizationNumber: '810007702',
    OrganizationForm: 'BEDR',
    OrganizationNumber: '810007842',
    Status: 'Active'
  },
  {
    Name: 'ANSTENDIG PIGGSVIN BYDEL',
    Type: 'Enterprise',
    ParentOrganizationNumber: '',
    OrganizationForm: 'ORGL',
    OrganizationNumber: '810007702',
    Status: 'Active'
  },
  {
    Name: 'ANSTENDIG PIGGSVIN SYKEHJEM',
    Type: 'Business',
    ParentOrganizationNumber: '810007702',
    OrganizationForm: 'BEDR',
    OrganizationNumber: '810007982',
    Status: 'Active'
  },
  {
    Name: 'SKOPPUM OG SANDØY',
    Type: 'Business',
    ParentOrganizationNumber: '',
    OrganizationForm: 'BEDR',
    OrganizationNumber: '911206722',
    Status: 'Active'
  },
  {
    Name: 'SKJERSTAD OG KJØRSVIKBUGEN',
    Type: 'Enterprise',
    ParentOrganizationNumber: '',
    OrganizationForm: 'AS',
    OrganizationNumber: '911212218',
    Status: 'Active'
  }
];
export default testOrganisasjoner;
