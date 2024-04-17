import formatRHFFeilmeldinger from '../../utils/formatRHFFeilmeldinger';

describe('formatRHFFeilmeldinger', () => {
  it('should return an empty array when the validationResult is empty', () => {
    const validationResult = {};

    const result = formatRHFFeilmeldinger(validationResult);

    expect(result).toEqual([]);
  });

  it('should return an array of Feilmelding objects when the validationResult has errors', () => {
    const validationResult = {
      errorTexts: [
        {
          field1: {
            message: 'Error 1'
          }
        },
        {
          field2: {
            message: 'Error 2'
          }
        }
      ]
    };

    const result = formatRHFFeilmeldinger(validationResult);

    expect(result).toEqual([
      {
        felt: 'errorTexts.0.field1.message',
        text: 'Error 1'
      },
      {
        felt: 'errorTexts.1.field2.message',
        text: 'Error 2'
      }
    ]);
  });

  it('should handle circular references in the validationResult', () => {
    const validationResult = {
      errorTexts: [
        {
          felt: 'field1',
          text: 'Error 1'
        }
      ]
    };
    validationResult.circularRef = validationResult;

    const result = formatRHFFeilmeldinger(validationResult);

    expect(result).toEqual([]);
  });
});
