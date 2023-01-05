import { MottatArbeidsgiver } from '../state/MottattData';

const testOrganisasjoner: MottatArbeidsgiver[] = [
  {
    navn: 'ANSTENDIG BJØRN KOMMUNE',
    type: 'Enterprise',
    orgnrHovedenhet: null,
    orgForm: 'KOMM',
    orgnr: '810007672',
    status: 'Active'
  },
  {
    navn: 'ANSTENDIG PIGGSVIN BRANNVESEN',
    type: 'Business',
    orgnrHovedenhet: '810007702',
    orgForm: 'BEDR',
    orgnr: '810008032',
    status: 'Active'
  },
  {
    navn: 'ANSTENDIG PIGGSVIN BARNEHAGE',
    type: 'Business',
    orgnrHovedenhet: '810007702',
    orgForm: 'BEDR',
    orgnr: '810007842',
    status: 'Active'
  },
  {
    navn: 'ANSTENDIG PIGGSVIN BYDEL',
    type: 'Enterprise',
    orgnrHovedenhet: null,
    orgForm: 'ORGL',
    orgnr: '810007702',
    status: 'Active'
  },
  {
    navn: 'ANSTENDIG PIGGSVIN SYKEHJEM',
    type: 'Business',
    orgnrHovedenhet: '810007702',
    orgForm: 'BEDR',
    orgnr: '810007982',
    status: 'Active'
  },
  {
    navn: 'SKOPPUM OG SANDØY',
    type: 'Business',
    orgnrHovedenhet: null,
    orgForm: 'BEDR',
    orgnr: '911206722',
    status: 'Active'
  },
  {
    navn: 'SKJERSTAD OG KJØRSVIKBUGEN',
    type: 'Enterprise',
    orgnrHovedenhet: null,
    orgForm: 'AS',
    orgnr: '911212218',
    status: 'Active'
  }
];
export default testOrganisasjoner;
