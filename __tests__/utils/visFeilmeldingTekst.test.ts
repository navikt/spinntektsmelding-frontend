import visFeilmeldingTekst from '../../utils/visFeilmeldingTekst';

describe('visFeilmeldingTekst', () => {
  it('should return an empty string when skalViseFeilmeldinger is false', () => {
    const result = visFeilmeldingTekst('id', false, []);
    expect(result).toBe('');
  });

  it('should return an empty string when feilmeldinger is undefined', () => {
    const result = visFeilmeldingTekst('id', true, undefined);
    expect(result).toBe('');
  });

  it('should return an empty string when feilmeldinger is empty', () => {
    const result = visFeilmeldingTekst('id', true, []);
    expect(result).toBe('');
  });

  it('should return an empty string when no matching feilmelding is found', () => {
    const feilmeldinger = [
      { felt: 'field1', text: 'Error 1' },
      { felt: 'field2', text: 'Error 2' },
      { felt: 'field3', text: 'Error 3' }
    ];
    const result = visFeilmeldingTekst('id', true, feilmeldinger);
    expect(result).toBe('');
  });

  it('should return the text of the matching feilmelding', () => {
    const feilmeldinger = [
      { felt: 'field1', text: 'Error 1' },
      { felt: 'id', text: 'Error 2' },
      { felt: 'field3', text: 'Error 3' }
    ];
    const result = visFeilmeldingTekst('id', true, feilmeldinger);
    expect(result).toBe('Error 2');
  });
});
