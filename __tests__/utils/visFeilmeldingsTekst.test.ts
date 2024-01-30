import visFeilmeldingsTekst from '../../utils/visFeilmeldingsTekst';

describe('visFeilmeldingsTekst', () => {
  it('should return an empty string when skalViseFeilmeldinger is false', () => {
    const result = visFeilmeldingsTekst('id', false, []);
    expect(result).toBe('');
  });

  it('should return an empty string when feilmeldinger is undefined', () => {
    const result = visFeilmeldingsTekst('id', true, undefined);
    expect(result).toBe('');
  });

  it('should return an empty string when feilmeldinger is empty', () => {
    const result = visFeilmeldingsTekst('id', true, []);
    expect(result).toBe('');
  });

  it('should return an empty string when no matching feilmelding is found', () => {
    const feilmeldinger = [
      { felt: 'field1', text: 'Error 1' },
      { felt: 'field2', text: 'Error 2' },
      { felt: 'field3', text: 'Error 3' }
    ];
    const result = visFeilmeldingsTekst('id', true, feilmeldinger);
    expect(result).toBe('');
  });

  it('should return the text of the matching feilmelding', () => {
    const feilmeldinger = [
      { felt: 'field1', text: 'Error 1' },
      { felt: 'id', text: 'Error 2' },
      { felt: 'field3', text: 'Error 3' }
    ];
    const result = visFeilmeldingsTekst('id', true, feilmeldinger);
    expect(result).toBe('Error 2');
  });
});
