import validerBekreftOpplysninger, { BekreftOpplysningerFeilkoder } from '../../validators/validerBekreftOpplysninger';

describe.concurrent('validerBekreftOpplysninger', () => {
  it('should return true when stuff is confirmed', () => {
    expect(validerBekreftOpplysninger(true)).toEqual([]);
  });

  it('should return false when stuff is not confirmed', () => {
    const expected = [
      {
        felt: 'bekreft-opplysninger',
        code: BekreftOpplysningerFeilkoder.BEKREFT_OPPLYSNINGER
      }
    ];
    expect(validerBekreftOpplysninger(false)).toEqual(expected);
  });
});
