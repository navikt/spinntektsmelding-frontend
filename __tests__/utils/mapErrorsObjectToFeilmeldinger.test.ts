import mapErrorsObjectToFeilmeldinger from '../../utils/mapErrorsObjectToFeilmeldinger';

describe.concurrent('mapErrorsObjectToFeilmeldinger', () => {
  it('should map errors object to feilmeldinger array', () => {
    const errors = {
      nested: {
        field: {
          message: 'Nested field error'
        }
      },
      field: {
        message: 'Field error'
      },
      otherField: {
        message: 'Other field error'
      },
      subField: {
        subSubField: {
          message: 'Sub sub field error'
        }
      }
    };

    const feilmeldinger = mapErrorsObjectToFeilmeldinger(errors);

    expect(feilmeldinger).toEqual([
      {
        felt: 'nested.field',
        text: 'Nested field error'
      },
      {
        felt: 'field',
        text: 'Field error'
      },
      {
        felt: 'otherField',
        text: 'Other field error'
      },
      {
        felt: 'subField.subSubField',
        text: 'Sub sub field error'
      }
    ]);
  });

  it('should handle empty errors object', () => {
    const errors = {};

    const feilmeldinger = mapErrorsObjectToFeilmeldinger(errors);

    expect(feilmeldinger).toEqual([]);
  });

  it('should handle nested errors object with missing message property', () => {
    const errors = {
      nested: {
        field: {
          otherProperty: 'Nested field error'
        }
      }
    };

    const feilmeldinger = mapErrorsObjectToFeilmeldinger(errors);

    expect(feilmeldinger).toEqual([
      {
        felt: 'nested.field.otherProperty',
        text: 'Nested field error'
      }
    ]);
  });
});
