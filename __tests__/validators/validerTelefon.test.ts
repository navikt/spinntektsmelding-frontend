import validerTelefon, { TelefonFeilkode } from '../../validators/validerTelefon';

describe('validerTelefon', () => {
  describe('gyldige numre', () => {
    it.each([
      ['med landkode og +', '+4712345678'],
      ['med landkode og 00', '004712345678'],
      ['kort nasjonalt nummer (8 siffer)', '12345678'],
      ['lengste nasjonale nummer (15 siffer)', '123456789012345'],
      ['+ med minimum 10 siffer', '+1234567890'],
      ['+ med maksimum 17 siffer', '+12345678901234567'],
      ['00 med minimum 10 siffer', '001234567890'],
      ['00 med maksimum 17 siffer', '0012345678901234567']
    ])('returnerer tom array når telefon er %s', (_beskrivelse, telefon) => {
      expect(validerTelefon(telefon)).toEqual([]);
    });
  });

  describe('manglende telefon', () => {
    it.each([
      ['undefined', undefined],
      ['tom streng', '']
    ])('returnerer TELEFON_MANGLER når telefon er %s', (_beskrivelse, telefon) => {
      expect(validerTelefon(telefon)).toEqual([
        {
          felt: 'telefon',
          code: TelefonFeilkode.TELEFON_MANGLER
        }
      ]);
    });
  });

  describe('ugyldig telefon', () => {
    it.each([
      ['inneholder bokstaver', 'ugyldig12345678'],
      ['for kort nasjonalt nummer (7 siffer)', '1234567'],
      ['for langt nasjonalt nummer (16 siffer)', '1234567890123456'],
      ['+ med for få siffer (9 siffer)', '+123456789'],
      ['00 med for få siffer (7 siffer etter 00)', '0012345'],
      ['+ med for mange siffer (18 siffer)', '+123456789012345678'],
      ['inneholder mellomrom', '+47 12345678'],
      ['inneholder bindestrek', '123-45678'],
      ['kun +', '+'],
      ['kun bokstaver', 'abcdefgh']
    ])('returnerer UGYLDIG_TELEFON når telefon %s', (_beskrivelse, telefon) => {
      expect(validerTelefon(telefon)).toEqual([
        {
          felt: 'telefon',
          code: TelefonFeilkode.UGYLDIG_TELEFON
        }
      ]);
    });
  });
});
