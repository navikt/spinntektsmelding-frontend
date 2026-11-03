import { describe, expect, it } from 'vitest';
import testOrganisasjoner from '../../mockdata/testOrganisasjoner';
import { mapArbeidsforhold, mapArbeidsgiverTilganger } from '../../utils/initieringArbeidsgivere';

const arbeidsgivere = testOrganisasjoner.slice(0, 2).map((org, index) => ({
  orgnrUnderenhet: org.organizationNumber,
  virksomhetsnavn: `Arbeidsgiver ${index}`
}));

describe('mapArbeidsforhold', () => {
  it.each([{ data: undefined }, { data: {} }, { data: { fulltNavn: 'Testperson', underenheter: [{}] } }])(
    'returns empty data for an invalid response: $data',
    ({ data }) => {
      expect(mapArbeidsforhold(data, false)).toEqual({
        arbeidsforhold: [],
        fulltNavn: '',
        orgnrUnderenhet: undefined,
        orgNavnMangler: false
      });
    }
  );

  it('discards valid data when the request has failed', () => {
    expect(mapArbeidsforhold({ fulltNavn: 'Testperson', underenheter: arbeidsgivere }, true)).toEqual(
      mapArbeidsforhold(undefined, false)
    );
  });

  it.each([0, 1, 2])('maps %i units and selects only a single unit automatically', (antallEnheter) => {
    const underenheter = arbeidsgivere.slice(0, antallEnheter);
    expect(mapArbeidsforhold({ fulltNavn: 'Testperson', underenheter }, false)).toEqual({
      arbeidsforhold: underenheter,
      fulltNavn: 'Testperson',
      orgnrUnderenhet: antallEnheter === 1 ? arbeidsgivere[0].orgnrUnderenhet : undefined,
      orgNavnMangler: false
    });
  });

  it('skips missing units without changing automatic selection based on the original list', () => {
    const result = mapArbeidsforhold({ fulltNavn: 'Testperson', underenheter: [undefined, arbeidsgivere[0]] }, false);

    expect(result.arbeidsforhold).toEqual([arbeidsgivere[0]]);
    expect(result.orgnrUnderenhet).toBeUndefined();
  });

  it('does not select a missing single unit', () => {
    const result = mapArbeidsforhold({ fulltNavn: 'Testperson', underenheter: [undefined] }, false);

    expect(result.arbeidsforhold).toEqual([]);
    expect(result.orgnrUnderenhet).toBeUndefined();
  });
});

describe('mapArbeidsgiverTilganger', () => {
  it.each([{ tilganger: undefined }, { tilganger: [] }])('returns no choices for $tilganger', ({ tilganger }) => {
    expect(mapArbeidsgiverTilganger(tilganger)).toEqual([]);
  });

  it('excludes roots and maps nested units in depth-first order across roots', () => {
    const tilganger = [
      {
        orgnr: '100',
        navn: 'Hovedenhet A',
        underenheter: [
          {
            orgnr: '101',
            navn: 'Underenhet A',
            underenheter: [{ orgnr: '102', navn: 'Nestet underenhet', underenheter: [] }]
          },
          { orgnr: '103', navn: 'Underenhet B', underenheter: [] }
        ]
      },
      {
        orgnr: '200',
        navn: 'Hovedenhet B',
        underenheter: [{ orgnr: '201', navn: 'Underenhet C', underenheter: [] }]
      }
    ];

    expect(mapArbeidsgiverTilganger(tilganger)).toEqual([
      { orgnrUnderenhet: '101', virksomhetsnavn: 'Underenhet A' },
      { orgnrUnderenhet: '102', virksomhetsnavn: 'Nestet underenhet' },
      { orgnrUnderenhet: '103', virksomhetsnavn: 'Underenhet B' },
      { orgnrUnderenhet: '201', virksomhetsnavn: 'Underenhet C' }
    ]);
  });

  it('returns no choices when roots have no units', () => {
    expect(mapArbeidsgiverTilganger([{ orgnr: '100', navn: 'Hovedenhet', underenheter: [] }])).toEqual([]);
  });
});
