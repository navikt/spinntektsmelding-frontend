class NetworkError extends Error {
  status = 200;
  info = {};
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export default NetworkError;
