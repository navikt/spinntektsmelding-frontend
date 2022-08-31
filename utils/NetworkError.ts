class NetworkError extends Error {
  status = 200;
  info = {};
  constructor(message: string) {
    super(message);
  }
}

export default NetworkError;
