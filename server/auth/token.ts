import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import type { NextApiRequest } from 'next';

export interface AuthResult {
  token: string;
}

export async function extractAndValidateToken(req: NextApiRequest): Promise<AuthResult> {
  const token = getToken(req);
  if (!token) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Mangler token i header');
  }
  const validation = await validateToken(token);
  if (!validation.ok) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Validering av token feilet');
  }
  return { token };
}

export interface OboResult {
  oboToken: string;
}

export async function getObo(token: string, clientId: string): Promise<OboResult> {
  const obo = await requestOboToken(token, clientId);
  if (!obo.ok) {
    throw new ApiError(401, 'UNAUTHORIZED', 'OBO-feil');
  }
  return { oboToken: obo.token };
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: any;
  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
