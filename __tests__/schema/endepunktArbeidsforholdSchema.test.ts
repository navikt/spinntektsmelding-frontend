import { endepunktArbeidsforholdSchema } from '../../schema/endepunktArbeidsforholdSchema';

describe('endepunktArbeidsforholdSchema', () => {
  it('validates the schema correctly', () => {
    const data = {
      fulltNavn: 'John Doe',
      underenheter: [
        {
          orgnrUnderenhet: '810008032',
          virksomhetsnavn: 'ANSTENDIG PIGGSVIN BRANNVESEN'
        },
        {
          orgnrUnderenhet: '810007842',
          virksomhetsnavn: 'ANSTENDIG PIGGSVIN BARNEHAGE'
        }
      ]
    };

    expect(endepunktArbeidsforholdSchema.safeParse(data).success).toBe(true);
  });

  it('returns an error when the schema validation fails', () => {
    const data = {
      fulltNavn: 'John Doe',
      underenheter: [
        {
          orgnrUnderenhet: '99810008032',
          virksomhetsnavn: 'ANSTENDIG PIGGSVIN BRANNVESEN'
        },
        {
          orgnrUnderenhet: '810007842',
          virksomhetsnavn: 123 // Invalid type
        }
      ]
    };

    expect(endepunktArbeidsforholdSchema.safeParse(data).success).toBe(false);
  });

  it('validates data with valid perioder', () => {
    const data = {
      fulltNavn: 'Jane Doe',
      underenheter: [
        {
          orgnrUnderenhet: '810008032',
          virksomhetsnavn: 'ANSTENDIG PIGGSVIN BRANNVESEN'
        },
        {
          orgnrUnderenhet: '810007842',
          virksomhetsnavn: 'ANSTENDIG PIGGSVIN BARNEHAGE'
        }
      ],
      perioder: [
        {
          fom: '2021-01-01',
          tom: '2021-12-31',
          id: 'periode-1'
        },
        {
          fom: '2022-02-01',
          tom: '2022-02-28',
          id: 'periode-2'
        }
      ]
    };
    const result = endepunktArbeidsforholdSchema.safeParse(data);
    expect(result.error).toBeUndefined();

    expect(result.success).toBe(true);
  });

  it('returns an error when perioder has an invalid ISO date', () => {
    const data = {
      fulltNavn: 'Jane Doe',
      underenheter: [],
      perioder: [
        {
          fom: '01-01-2021', // invalid format
          tom: '2021-12-31',
          id: 'periode-1'
        }
      ]
    };
    const result = endepunktArbeidsforholdSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Dato er ikke i ISO-format/);
    }
  });

  it('validates when underenheter is omitted', () => {
    const data = {
      fulltNavn: 'John Without Units',
      underenheter: []
      // underenheter and perioder both omitted
    };
    const result = endepunktArbeidsforholdSchema.safeParse(data);
    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
  });
});
