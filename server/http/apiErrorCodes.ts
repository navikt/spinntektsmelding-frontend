export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  OBO_FEIL = 'OBO_FEIL',
  TILGANG_MANGEL = 'TILGANG_MANGEL',
  FLEXJAR_PROXY_FEIL = 'FLEXJAR_PROXY_FEIL',
  INNSENDING_FEIL = 'INNSENDING_FEIL'
}

export const codeToHttpStatus: Record<ApiErrorCode, number> = {
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.VALIDATION_ERROR]: 400,
  [ApiErrorCode.BAD_REQUEST]: 400,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.UPSTREAM_ERROR]: 502,
  [ApiErrorCode.OBO_FEIL]: 401,
  [ApiErrorCode.TILGANG_MANGEL]: 403,
  [ApiErrorCode.FLEXJAR_PROXY_FEIL]: 502,
  [ApiErrorCode.INNSENDING_FEIL]: 400
};

export interface ApiErrorShape {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export function createApiError(code: ApiErrorCode, message: string, details?: unknown): ApiErrorShape {
  return { error: { code, message, details } };
}

export function isApiErrorShape(val: any): val is ApiErrorShape {
  return val && typeof val === 'object' && val.error && typeof val.error.code === 'string';
}
