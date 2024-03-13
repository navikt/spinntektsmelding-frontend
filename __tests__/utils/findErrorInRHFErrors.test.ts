import findErrorInRHFErrors from '../../utils/findErrorInRHFErrors';

describe('findErrorInRHFErrors', () => {
  it('should return the error message for a nested field', () => {
    const errors = {
      nested: {
        field: {
          message: 'Nested field error'
        }
      }
    };
    const error = findErrorInRHFErrors('nested.field', errors);
    expect(error).toBe('Nested field error');
  });

  it('should return the error value for a non-nested field', () => {
    const errors = {
      field: 'Field error'
    };
    const error = findErrorInRHFErrors('field', errors);
    expect(error).toBe('Field error');
  });

  it('should return undefined if the field does not exist in the errors object', () => {
    const errors = {
      otherField: 'Other field error'
    };
    const error = findErrorInRHFErrors('field', errors);
    expect(error).toBeUndefined();
  });

  it('should return undefined if the errors object is empty', () => {
    const errors = {};
    const error = findErrorInRHFErrors('field', errors);
    expect(error).toBeUndefined();
  });
});
