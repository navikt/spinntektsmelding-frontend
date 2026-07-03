import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postInnsending } from '../../utils/postInnsending';
import { ErrorResponse } from '../../utils/useErrorResponse';

// Mock logEvent to avoid side effects
vi.mock('../../utils/logEvent', () => ({ __esModule: true, default: vi.fn() }));

// Mock logger
const warnSpy = vi.fn();
vi.mock('@navikt/next-logger', () => ({ logger: { warn: (...args: any[]) => warnSpy(...args) } }));

// Helper to build fetch Response mock
function buildResponse(status: number, jsonData?: any): Response {
  return {
    status,
    json: async () => jsonData,
    text: async () => JSON.stringify(jsonData)
  } as unknown as Response;
}

describe('postInnsending', () => {
  const url = '/api/test';
  const body = { a: 1 };
  let unauthorized: any;
  let success: any;
  let mapValidationErrors: any;
  let setErrorResponse: any;
  let setShowErrorList: any;

  beforeEach(() => {
    unauthorized = vi.fn();
    success = vi.fn();
    mapValidationErrors = vi.fn((feil, _errors: ErrorResponse[]) =>
      feil.valideringsfeil.map((f: string) => ({
        error: f,
        property: 'server',
        value: 'Innsending av skjema feilet'
      }))
    );
    setErrorResponse = vi.fn();
    setShowErrorList = vi.fn();
    warnSpy.mockClear();
  });

  it('kaller onSuccess ved 201 og parser json', async () => {
    global.fetch = vi.fn().mockResolvedValue(buildResponse(201, { ok: true }));

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(success).toHaveBeenCalledWith({ ok: true });
    expect(unauthorized).not.toHaveBeenCalled();
  });

  it('kaller onUnauthorized ved 401', async () => {
    global.fetch = vi.fn().mockResolvedValue(buildResponse(401));

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(unauthorized).toHaveBeenCalledTimes(1);
    expect(success).not.toHaveBeenCalled();
  });

  it('returnerer serverfeil (500) med setErrorResponse', async () => {
    global.fetch = vi.fn().mockResolvedValue(buildResponse(500));

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(setErrorResponse).toHaveBeenCalledTimes(1);
    const errs = setErrorResponse.mock.calls[0][0];
    expect(errs[0].error).toContain('akkurat nå en feil');
  });

  it('returnerer valideringsfeil ved 400 BadRequest', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      buildResponse(400, {
        error: 'Feltet er ugyldig'
      })
    );

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(mapValidationErrors).toHaveBeenCalledTimes(1);
    expect(setErrorResponse).toHaveBeenCalledTimes(1);
    expect(setShowErrorList).toHaveBeenCalledWith(true);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('setter generisk feil ved 400 når error har feil type', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      buildResponse(400, {
        error: 123
      })
    );

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(mapValidationErrors).toHaveBeenCalledWith(
      { error: 'Validering av skjema feilet', valideringsfeil: ['Validering av skjema feilet'] },
      []
    );
    expect(setErrorResponse).toHaveBeenCalledTimes(1);
    expect(setErrorResponse.mock.calls[0][0][0].error).toBe('Validering av skjema feilet');
    expect(setShowErrorList).toHaveBeenCalledWith(true);
  });

  it('setter generisk feil ved 400 når error-feltet mangler', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      buildResponse(400, {
        feilmelding: 'noe gikk galt'
      })
    );

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(mapValidationErrors).toHaveBeenCalledWith(
      { error: 'Validering av skjema feilet', valideringsfeil: ['Validering av skjema feilet'] },
      []
    );
    expect(setErrorResponse).toHaveBeenCalledTimes(1);
    expect(setErrorResponse.mock.calls[0][0][0].error).toBe('Validering av skjema feilet');
    expect(setShowErrorList).toHaveBeenCalledWith(true);
  });

  it('setter generisk feil ved 400 når JSON er ugyldig', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 400,
      json: async () => {
        throw new Error('ugyldig json');
      },
      text: async () => 'ikke json'
    } as any);

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(mapValidationErrors).toHaveBeenCalledWith(
      { error: 'Validering av skjema feilet', valideringsfeil: ['Validering av skjema feilet'] },
      []
    );
    expect(setErrorResponse).toHaveBeenCalledTimes(1);
    expect(setErrorResponse.mock.calls[0][0][0].error).toBe('Validering av skjema feilet');
    expect(setShowErrorList).toHaveBeenCalledWith(true);
  });

  it('returnerer valideringsfeil ved 400-lignende default case med backend error-format', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      buildResponse(418, {
        // "I'm a teapot" -> default branch
        error: 'Validation',
        valideringsfeil: ['Felt 1 er ugyldig', 'Felt 2 mangler']
      })
    );

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(mapValidationErrors).toHaveBeenCalled();
    expect(setErrorResponse).toHaveBeenCalled();
    expect(setShowErrorList).toHaveBeenCalledWith(true);
  });

  it('logger 404 feil', async () => {
    global.fetch = vi.fn().mockResolvedValue(buildResponse(404));

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(warnSpy).toHaveBeenCalled();
  });

  it('tåler manglende/ugyldig JSON i success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => {
        throw new Error('no json');
      },
      text: async () => ''
    } as any);

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(success).toHaveBeenCalledWith(null); // fallback når parsing feiler
  });

  it('håndterer network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('ECONNRESET'));

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    expect(setErrorResponse).toHaveBeenCalled();
    expect(setShowErrorList).toHaveBeenCalledWith(true);
  });

  it('ignorerer ugyldig JSON i default-case uten crash', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 418,
      json: async () => {
        throw new Error('syntax');
      },
      text: async () => ''
    } as any);

    await postInnsending({
      url,
      body,
      analyticsComponent: 'comp',
      onUnauthorized: unauthorized,
      onSuccess: success,
      mapValidationErrors,
      setErrorResponse,
      setShowErrorList
    });

    // Ingen validation errors trigget fordi parsing feilet
    expect(setErrorResponse).not.toHaveBeenCalled();
  });

  describe('handleDefaultResponse', () => {
    it('mapper error-melding når backend-feil har fylt error-felt', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        buildResponse(422, {
          error: 'Backend feilet',
          valideringsfeil: ['Felt er ugyldig']
        })
      );

      await postInnsending({
        url,
        body,
        analyticsComponent: 'comp',
        onUnauthorized: unauthorized,
        onSuccess: success,
        mapValidationErrors,
        setErrorResponse,
        setShowErrorList
      });

      expect(mapValidationErrors).toHaveBeenCalledWith(
        { error: 'Backend feilet', valideringsfeil: ['Felt er ugyldig'] },
        []
      );
      expect(setErrorResponse.mock.calls[0][0][0].error).toBe('Felt er ugyldig');
      expect(setShowErrorList).toHaveBeenCalledWith(true);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('bruker error som valideringsfeil når valideringsfeil er tom array', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        buildResponse(422, {
          error: 'Backend feilet',
          valideringsfeil: []
        })
      );

      await postInnsending({
        url,
        body,
        analyticsComponent: 'comp',
        onUnauthorized: unauthorized,
        onSuccess: success,
        mapValidationErrors,
        setErrorResponse,
        setShowErrorList
      });

      expect(mapValidationErrors).toHaveBeenCalledWith(
        { error: 'Backend feilet', valideringsfeil: ['Backend feilet'] },
        []
      );
      expect(setErrorResponse.mock.calls[0][0][0].error).toBe('Backend feilet');
      expect(setShowErrorList).toHaveBeenCalledWith(true);
    });

    it('mapper valideringsfeil direkte når error-felt er tomt', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        buildResponse(422, {
          error: '',
          valideringsfeil: ['Felt 1 er ugyldig', 'Felt 2 mangler']
        })
      );

      await postInnsending({
        url,
        body,
        analyticsComponent: 'comp',
        onUnauthorized: unauthorized,
        onSuccess: success,
        mapValidationErrors,
        setErrorResponse,
        setShowErrorList
      });

      expect(mapValidationErrors).toHaveBeenCalledWith(
        { error: '', valideringsfeil: ['Felt 1 er ugyldig', 'Felt 2 mangler'] },
        []
      );
      expect(setErrorResponse).toHaveBeenCalledTimes(1);
      const errs = setErrorResponse.mock.calls[0][0];
      expect(errs.map((e: ErrorResponse) => e.error)).toEqual(['Felt 1 er ugyldig', 'Felt 2 mangler']);
      expect(setShowErrorList).toHaveBeenCalledWith(true);
    });

    it('bruker error som valideringsfeil når valideringsfeil mangler', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        buildResponse(422, {
          error: 'Mangler valideringsfeil'
        })
      );

      await postInnsending({
        url,
        body,
        analyticsComponent: 'comp',
        onUnauthorized: unauthorized,
        onSuccess: success,
        mapValidationErrors,
        setErrorResponse,
        setShowErrorList
      });

      expect(mapValidationErrors).toHaveBeenCalledWith(
        { error: 'Mangler valideringsfeil', valideringsfeil: ['Mangler valideringsfeil'] },
        []
      );
      expect(setErrorResponse.mock.calls[0][0][0].error).toBe('Mangler valideringsfeil');
      expect(setShowErrorList).toHaveBeenCalledWith(true);
    });

    it('setter ingen feil når respons mangler error-felt', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        buildResponse(422, {
          feilmelding: 'noe gikk galt'
        })
      );

      await postInnsending({
        url,
        body,
        analyticsComponent: 'comp',
        onUnauthorized: unauthorized,
        onSuccess: success,
        mapValidationErrors,
        setErrorResponse,
        setShowErrorList
      });

      expect(mapValidationErrors).not.toHaveBeenCalled();
      expect(setErrorResponse).not.toHaveBeenCalled();
      expect(setShowErrorList).not.toHaveBeenCalled();
    });

    it('logger og krasjer ikke når JSON-parsing feiler i default-case', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 422,
        json: async () => {
          throw new Error('ugyldig json');
        },
        text: async () => 'ikke json'
      } as any);

      await postInnsending({
        url,
        body,
        analyticsComponent: 'comp',
        onUnauthorized: unauthorized,
        onSuccess: success,
        mapValidationErrors,
        setErrorResponse,
        setShowErrorList
      });

      expect(setErrorResponse).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });
  });
});
