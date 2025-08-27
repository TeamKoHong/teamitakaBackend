const jose = require('jose');

async function verifyGoogleIdToken(idToken, expectedAud) {
  if (!idToken) throw new Error('missing idToken');
  if (!expectedAud) throw new Error('missing GOOGLE_OAUTH_CLIENT_ID');

  const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
  const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URL));
  const { payload } = await jose.jwtVerify(idToken, JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: expectedAud,
  });
  return payload; // includes email, email_verified, sub, name, picture, etc.
}

module.exports = { verifyGoogleIdToken };


