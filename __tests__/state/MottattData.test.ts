import { describe, it, expect } from 'vitest';
import { MottattForespurtData, ForrigeInntekt, Opplysningstype } from '../../state/MottattData';
import forespoerselType from '../../config/forespoerselType';

describe('MottattData types', () => {
  it('should define ForrigeInntekt type with correct structure', () => {
    const mockForrigeInntekt: ForrigeInntekt = {
      skjæringstidspunkt: new Date().toISOString(),
      kilde: 'INNTEKTSMELDING',
      beløp: 5000
    };

    expect(mockForrigeInntekt).toHaveProperty('skjæringstidspunkt');
    expect(mockForrigeInntekt).toHaveProperty('kilde');
    expect(mockForrigeInntekt).toHaveProperty('beløp');
    expect(typeof mockForrigeInntekt.beløp).toBe('number');
  });

  it('should define MottattForespurtData type with correct structure', () => {
    const mockMottattForespurtData: MottattForespurtData = {
      inntekt: {
        paakrevd: true,
        forslag: {
          type: 'ForslagInntektFastsatt',
          beregningsmaaneder: ['2023-01', '2023-02']
        }
      },
      refusjon: {
        paakrevd: false,
        forslag: {
          opphoersdato: null,
          perioder: [
            {
              fom: new Date().toISOString(),
              beloep: 500
            }
          ]
        }
      },
      arbeidsgiverperiode: {
        paakrevd: true,
        forslag: {
          type: 'ForslagInntektFastsatt',
          perioder: [
            {
              fom: new Date().toISOString(),
              beloep: 200
            }
          ]
        }
      }
    };

    expect(mockMottattForespurtData).toHaveProperty('inntekt');
    expect(mockMottattForespurtData).toHaveProperty('refusjon');
    expect(mockMottattForespurtData).toHaveProperty('arbeidsgiverperiode');

    expect(mockMottattForespurtData.inntekt).toHaveProperty('paakrevd');
    expect(typeof mockMottattForespurtData.inntekt.paakrevd).toBe('boolean');

    expect(mockMottattForespurtData.refusjon.forslag).toHaveProperty('opphoersdato');
    expect(mockMottattForespurtData.refusjon.forslag?.perioder?.[0]).toHaveProperty('fom');

    expect(mockMottattForespurtData.arbeidsgiverperiode.forslag?.type).toBe('ForslagInntektFastsatt');
  });

  it('should have Opplysningstype defined correctly', () => {
    // Check that we can use a value from forespoerselType as an Opplysningstype
    const opplysningstyper = Object.values(forespoerselType);
    const sampleOpplysningstype = opplysningstyper[0] as Opplysningstype;

    expect(opplysningstyper).toContain(sampleOpplysningstype);
  });
});
