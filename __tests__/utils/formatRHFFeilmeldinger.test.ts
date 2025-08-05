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
        felt: 'errorTexts.0.field1',
        text: 'Error 1'
      },
      {
        felt: 'errorTexts.1.field2',
        text: 'Error 2'
      }
    ]);
  });

  it.skip('should handle circular references in the validationResult', () => {
    const circularValidationInput = {
      errorTexts: [
        {
          field1: {
            message: 'Circular Error 1'
          }
        }
      ]
    };
    circularValidationInput.circularRef = circularValidationInput;

    const circularValidationResult = [
      {
        felt: 'errorTexts.0',
        message: 'Circular Error 1'
      }
    ];

    const result = formatRHFFeilmeldinger(circularValidationResult);

    expect(result).toEqual(circularValidationResult);
  });
});
