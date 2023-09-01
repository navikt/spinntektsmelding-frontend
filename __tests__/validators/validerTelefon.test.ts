import validerTelefon, { TelefonFeilkode } from '../../validators/validerTelefon';

describe('validerTelefon', () => {
  it('should return an empty array if telefon is valid, with countrycode and +', () => {
    const telefon = '+4712345678';
    const result = validerTelefon(telefon);
    expect(result).toEqual([]);
  });

  it('should return an empty array if telefon is valid, with countrycode and 00', () => {
    const telefon = '004712345678';
    const result = validerTelefon(telefon);
    expect(result).toEqual([]);
  });

  it('should return an empty array if telefon is valid, shortish number', () => {
    const telefon = '12345678';
    const result = validerTelefon(telefon);
    expect(result).toEqual([]);
  });

  it('should return an array with TELEFON_MANGLER if telefon is undefined', () => {
    const telefon = undefined;
    const result = validerTelefon(telefon);
    expect(result).toEqual([
      {
        felt: 'telefon',
        code: TelefonFeilkode.TELEFON_MANGLER
      }
    ]);
  });

  it('should return an array with UGYLDIG_TELEFON if telefon is invalid', () => {
    const telefon = 'ugyldig12345678';
    const result = validerTelefon(telefon);
    expect(result).toEqual([
      {
        felt: 'telefon',
        code: TelefonFeilkode.UGYLDIG_TELEFON
      }
    ]);
  });
});
