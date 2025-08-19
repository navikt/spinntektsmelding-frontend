// En liten helper for å sette RHF-feil basert på statuskoder.
// Valgfritt: spesialhåndter 401 (for eksempel redirect).
type ErrorLike = { status?: number };
type SetError = (name: string, err: { type: string; error: string }) => void;

export function buildSWRFormErrorHandler(opts: {
  setError: SetError;
  field: string;
  messages: {
    unauthorized?: string; // 401
    notFound?: string; // 404
    default: string; // alt annet
  };
  onUnauthorized?: (err: ErrorLike) => void;
}) {
  const { setError, field, messages, onUnauthorized } = opts;

  return (err: ErrorLike) => {
    if (err?.status === 401) {
      if (onUnauthorized) return onUnauthorized(err);
      if (messages.unauthorized) {
        setError(field, { type: 'manual', error: messages.unauthorized });
      }
      return;
    }
    if (err?.status === 404 && messages.notFound) {
      setError(field, { type: 'manual', error: messages.notFound });
      return;
    }
    if ((err?.status ?? 500) !== 200) {
      setError(field, { type: 'manual', error: messages.default });
    }
  };
}
