import { logger } from '@navikt/next-logger';
import { Client, errors, GrantBody, Issuer } from 'openid-client';

const OPError = errors.OPError;

let _issuer: Issuer<Client>;
let _client: Client;

async function issuer() {
  if (typeof _issuer === 'undefined') {
    if (!global.process.env.TOKEN_X_WELL_KNOWN_URL)
      throw new TypeError('Miljøvariabelen "TOKEN_X_WELL_KNOWN_URL må være satt');
    _issuer = await Issuer.discover(global.process.env.TOKEN_X_WELL_KNOWN_URL);
  }
  return _issuer;
}

function jwk() {
  if (!global.process.env.TOKEN_X_PRIVATE_JWK) throw new TypeError('Miljøvariabelen "TOKEN_X_PRIVATE_JWK må være satt');
  return JSON.parse(global.process.env.TOKEN_X_PRIVATE_JWK);
}

async function client() {
  if (typeof _client === 'undefined') {
    if (!global.process.env.TOKEN_X_CLIENT_ID) throw new TypeError('Miljøvariabelen "TOKEN_X_CLIENT_ID må være satt');

    const _jwk = jwk();
    const _issuer = await issuer();
    _client = new _issuer.Client(
      {
        client_id: global.process.env.TOKEN_X_CLIENT_ID,
        token_endpoint_auth_method: 'private_key_jwt'
      },
      { keys: [_jwk] }
    );
  }
  return _client;
}

export async function getTokenxToken(subject_token: string, audience: string): Promise<string | undefined> {
  const _client = await client();

  const now = Math.floor(Date.now() / 1000);
  const additionalClaims = {
    clientAssertionPayload: {
      nbf: now,
      aud: _client.issuer.metadata.token_endpoint
    }
  };

  const grantBody: GrantBody = {
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    audience,
    subject_token
  };

  try {
    const grant = await _client.grant(grantBody, additionalClaims);
    return grant.access_token;
  } catch (err: any) {
    if (err.constructor === OPError) {
      logger.error(
        `Noe gikk galt med token exchange mot TokenX. Feilmelding fra openid-client: (${err}).
                HTTP Status fra TokenX: (${err.response?.statusCode} ${err.response?.statusMessage})
                Body fra TokenX: ${err.response?.body}`
      );
    }

    throw err;
  }
}
