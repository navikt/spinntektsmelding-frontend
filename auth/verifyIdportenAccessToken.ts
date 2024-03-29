import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, jwtVerify } from 'jose';
import { GetKeyFunction } from 'jose/dist/types/types';
import { Client, Issuer } from 'openid-client';

let _issuer: Issuer<Client>;
let _remoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

async function validerToken(token: string | Uint8Array) {
  return jwtVerify(token, await jwks(), {
    issuer: (await issuer()).metadata.issuer
  });
}

async function jwks() {
  if (typeof _remoteJWKSet === 'undefined') {
    const iss = await issuer();
    _remoteJWKSet = createRemoteJWKSet(new URL(<string>iss.metadata.jwks_uri));
  }

  return _remoteJWKSet;
}

async function issuer() {
  if (typeof _issuer === 'undefined') {
    if (!global.process.env.IDPORTEN_WELL_KNOWN_URL)
      throw new Error('Miljøvariabelen "IDPORTEN_WELL_KNOWN_URL" må være satt');
    _issuer = await Issuer.discover(global.process.env.IDPORTEN_WELL_KNOWN_URL);
  }
  return _issuer;
}

export async function verifyIdportenAccessToken(bearerToken: string) {
  const token = bearerToken.split(' ')[1];

  const verified = await validerToken(token);

  if (verified.payload.client_id !== global.process.env.IDPORTEN_CLIENT_ID) {
    throw new Error('client_id matcher ikke servers clientId.');
  }

  if (!['Level4', 'idporten-loa-high'].includes(verified.payload.acr as string)) {
    throw new AuthenticationError('Har ikke ACR Level4 eller idporten-loa-high.');
  }
}

export class FetchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class AuthenticationError extends FetchError {
  constructor(message: string) {
    super(message, 401);
  }
}
