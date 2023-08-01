import NetworkError from '../../utils/NetworkError';

describe('NetworkError', () => {
  it('should set the message property correctly', () => {
    const message = 'Network error occurred';
    const error = new NetworkError(message);
    expect(error.message).toBe(message);
  });

  it('should set the status property to 200', () => {
    const error = new NetworkError('Network error occurred');
    expect(error.status).toBe(200);
  });

  it('should set the info property to an empty object', () => {
    const error = new NetworkError('Network error occurred');
    expect(error.info).toEqual({});
  });
});
