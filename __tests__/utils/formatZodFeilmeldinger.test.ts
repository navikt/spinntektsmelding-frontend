import formatZodFeilmeldinger from '../../utils/formatZodFeilmeldinger';

describe('formatZodFeilmeldinger', () => {
  it('returns an empty array when the validationResult is successful', () => {
    const validationResult = {
      success: true,
      error: null
    };

    const result = formatZodFeilmeldinger(validationResult);

    expect(result).toEqual([]);
  });

  it('returns an array of formatted error messages when the validationResult is unsuccessful', () => {
    const validationResult = {
      success: false,
      error: {
        format: () => ({
          field1: {
            _errors: ['Error 1', 'Error 2']
          },
          field2: {
            _errors: ['Error 3']
          }
        })
      }
    };

    const result = formatZodFeilmeldinger(validationResult);

    expect(result).toEqual([
      {
        text: 'Error 1, Error 2',
        felt: 'field1'
      },
      {
        text: 'Error 3',
        felt: 'field2'
      }
    ]);
  });
});
