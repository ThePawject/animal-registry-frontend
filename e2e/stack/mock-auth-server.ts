import { Buffer } from 'node:buffer'
import {
  createPrivateKey,
  createPublicKey,
  createSign,
  generateKeyPairSync,
  randomUUID,
} from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import process from 'node:process'
import { AUTH, PATHS, PORTS, URLS } from '../config/env.ts'
import { log, onShutdown } from './process.ts'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { KeyObject } from 'node:crypto'

/**
 * A minimal OpenID Connect provider that stands in for Auth0.
 *
 * It speaks exactly the subset of the protocol that `@auth0/auth0-spa-js`
 * (browser) and ASP.NET Core's JWT bearer handler (API) use:
 *
 *   GET  /.well-known/openid-configuration   discovery, read by the API
 *   GET  /.well-known/jwks.json              signing key, read by the API
 *   GET  /authorize                          login page (or silent-auth error)
 *   GET  /authorize/complete                 login form target, issues a code
 *   POST /oauth/token                        code / refresh_token exchange
 *   GET  /v2/logout                          redirects back to the app
 *   POST /e2e/token                          test-only: mint an API token
 *   GET  /health
 *
 * The server keeps no state. Authorization codes and refresh tokens are just
 * the encoded identity, so tests can sign in as any user they invent and a
 * restart never invalidates a session. That is fine for a test double and
 * would be a terrible idea anywhere else.
 */

export type MockIdentity = {
  /** Stable user id, becomes the `sub` and `user_id` claims. */
  id: string
  email: string
  roles: Array<string>
}

type Grant = {
  identity: MockIdentity
  audience: string
  scope: string
  clientId: string
  nonce?: string
}

const KEY_ID = 'e2e-signing-key'
const TOKEN_LIFETIME_SECONDS = 24 * 60 * 60

// ---------------------------------------------------------------------------
// Signing key
// ---------------------------------------------------------------------------

/**
 * The key is cached on disk so that a restarted mock keeps signing with the
 * key an already-running API has cached from the JWKS endpoint.
 */
function loadOrCreatePrivateKey(): KeyObject {
  if (existsSync(PATHS.signingKey)) {
    return createPrivateKey(readFileSync(PATHS.signingKey, 'utf8'))
  }
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  mkdirSync(path.dirname(PATHS.signingKey), { recursive: true })
  writeFileSync(
    PATHS.signingKey,
    privateKey.export({ type: 'pkcs8', format: 'pem' }),
    { mode: 0o600 },
  )
  return privateKey
}

const privateKey = loadOrCreatePrivateKey()
const publicJwk = {
  ...createPublicKey(privateKey).export({ format: 'jwk' }),
  kid: KEY_ID,
  alg: 'RS256',
  use: 'sig',
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

const base64Url = (value: string | Buffer) =>
  Buffer.from(value).toString('base64url')

const decodeJson = <T>(value: string): T =>
  JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T

function signJwt(payload: Record<string, unknown>) {
  const header = { alg: 'RS256', typ: 'JWT', kid: KEY_ID }
  const encodedPayload = base64Url(JSON.stringify(payload))

  // The app reads the access token with `atob`, which only understands the
  // classic base64 alphabet. Real Auth0 tokens happen to avoid `-` and `_`
  // because their payloads are plain ASCII without `>`, `?` or `~`; fail
  // loudly if a test identity would break that assumption.
  if (/[-_]/.test(encodedPayload)) {
    throw new Error(
      'Token payload must not contain ">", "?", "~" or non-ASCII characters: the app decodes it with atob().',
    )
  }

  const signingInput = `${base64Url(JSON.stringify(header))}.${encodedPayload}`
  const signature = createSign('RSA-SHA256')
    .update(signingInput)
    .sign(privateKey)
  return `${signingInput}.${base64Url(signature)}`
}

function issueAccessToken({ identity, audience, scope, clientId }: Grant) {
  const now = Math.floor(Date.now() / 1000)
  return signJwt({
    iss: AUTH.issuer,
    sub: identity.id,
    aud: [audience],
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
    azp: clientId,
    scope,
    jti: randomUUID(),
    [AUTH.rolesClaim]: identity.roles,
    [AUTH.userIdClaim]: identity.id,
    [AUTH.emailClaim]: identity.email,
  })
}

function issueIdToken({ identity, clientId, nonce }: Grant) {
  const now = Math.floor(Date.now() / 1000)
  return signJwt({
    iss: AUTH.issuer,
    sub: identity.id,
    aud: clientId,
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
    ...(nonce ? { nonce } : {}),
    email: identity.email,
    name: identity.email,
  })
}

function tokenResponse(grant: Grant) {
  return {
    access_token: issueAccessToken(grant),
    id_token: issueIdToken(grant),
    // Refreshing never needs the nonce again.
    refresh_token: base64Url(JSON.stringify({ ...grant, nonce: undefined })),
    token_type: 'Bearer',
    expires_in: TOKEN_LIFETIME_SECONDS,
    scope: grant.scope,
  }
}

function parseIdentity(email: string, rolesInput: string, id?: string) {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) throw new HttpError(400, 'email is required')
  return {
    id: id?.trim() || `e2e|${trimmedEmail}`,
    email: trimmedEmail,
    roles: rolesInput
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean),
  } satisfies MockIdentity
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(body))
}

function sendHtml(response: ServerResponse, html: string) {
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(html)
}

function redirect(response: ServerResponse, location: string) {
  response.writeHead(302, { Location: location, 'Cache-Control': 'no-store' })
  response.end()
}

async function readBody(request: IncomingMessage) {
  const chunks: Array<Buffer> = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  const raw = Buffer.concat(chunks).toString('utf8')
  const contentType = request.headers['content-type'] ?? ''
  if (contentType.includes('application/json')) {
    return new Map(
      Object.entries(JSON.parse(raw || '{}') as Record<string, unknown>),
    )
  }
  return new Map<string, unknown>(new URLSearchParams(raw))
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!,
  )

/** Only ever send the browser back to the app under test. */
function assertAppUrl(value: string | null, parameter: string) {
  if (!value) throw new HttpError(400, `${parameter} is required`)
  if (new URL(value).origin !== URLS.frontend) {
    throw new HttpError(400, `${parameter} must point at ${URLS.frontend}`)
  }
  return value
}

/** Response used by the Auth0 SDK for popup and silent (iframe) flows. */
function webMessagePage(targetOrigin: string, payload: Record<string, string>) {
  return `<!doctype html>
<title>Authorization response</title>
<script>
  const target = window.opener || window.parent;
  target.postMessage(
    { type: 'authorization_response', response: ${JSON.stringify(payload)} },
    ${JSON.stringify(targetOrigin)},
  );
</script>`
}

/**
 * The stand-in for the Auth0 Universal Login page. Tests fill it in through
 * `MockLoginPage`; a human can use it too when poking at the stack manually.
 */
function loginPage(query: URLSearchParams) {
  const hidden = [...query.entries()]
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`,
    )
    .join('\n      ')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>E2E mock login</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 28rem; margin: 4rem auto; }
      label { display: block; margin: 1rem 0 0.25rem; }
      input[type=text], input[type=email] { width: 100%; padding: 0.5rem; box-sizing: border-box; }
      button { margin-top: 1.5rem; padding: 0.6rem 1.2rem; }
      small { color: #555; }
    </style>
  </head>
  <body>
    <h1>E2E mock login</h1>
    <p><small>Stand-in for Auth0. Signs in as whoever you describe below.</small></p>
    <form method="get" action="/authorize/complete">
      ${hidden}
      <label for="email">Email</label>
      <input id="email" name="e2e_email" type="email" required autofocus>
      <label for="roles">Roles (comma separated)</label>
      <input id="roles" name="e2e_roles" type="text" placeholder="${AUTH.shelterRolePrefix}My_Shelter">
      <button type="submit">Sign in</button>
    </form>
  </body>
</html>`
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

function handleAuthorize(url: URL, response: ServerResponse) {
  const query = url.searchParams
  const redirectUri = assertAppUrl(query.get('redirect_uri'), 'redirect_uri')

  // Silent authentication has no session to fall back on here; answering
  // `login_required` is what Auth0 does for a signed-out user.
  if (query.get('prompt') === 'none') {
    return sendHtml(
      response,
      webMessagePage(new URL(redirectUri).origin, {
        error: 'login_required',
        error_description: 'Login required',
        state: query.get('state') ?? '',
      }),
    )
  }

  sendHtml(response, loginPage(query))
}

function handleAuthorizeComplete(url: URL, response: ServerResponse) {
  const query = url.searchParams
  const redirectUri = assertAppUrl(query.get('redirect_uri'), 'redirect_uri')
  const state = query.get('state') ?? ''

  const grant: Grant = {
    identity: parseIdentity(
      query.get('e2e_email') ?? '',
      query.get('e2e_roles') ?? '',
    ),
    audience: query.get('audience') ?? AUTH.audience,
    scope: query.get('scope') ?? 'openid',
    clientId: query.get('client_id') ?? AUTH.clientId,
    nonce: query.get('nonce') ?? undefined,
  }
  const code = base64Url(JSON.stringify(grant))

  if (query.get('response_mode') === 'web_message') {
    return sendHtml(
      response,
      webMessagePage(new URL(redirectUri).origin, { code, state }),
    )
  }

  const target = new URL(redirectUri)
  target.searchParams.set('code', code)
  target.searchParams.set('state', state)
  redirect(response, target.toString())
}

async function handleToken(request: IncomingMessage, response: ServerResponse) {
  const body = await readBody(request)
  const grantType = body.get('grant_type')

  if (grantType === 'authorization_code') {
    return sendJson(
      response,
      200,
      tokenResponse(decodeJson<Grant>(String(body.get('code')))),
    )
  }
  if (grantType === 'refresh_token') {
    return sendJson(
      response,
      200,
      tokenResponse(decodeJson<Grant>(String(body.get('refresh_token')))),
    )
  }
  throw new HttpError(400, `unsupported grant_type "${String(grantType)}"`)
}

/** Lets tests call the API directly, e.g. to seed data, without a browser. */
async function handleTestToken(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const body = await readBody(request)
  const roles = body.get('roles')
  const identity = parseIdentity(
    String(body.get('email') ?? ''),
    Array.isArray(roles) ? roles.join(',') : String(roles ?? ''),
    body.get('id') ? String(body.get('id')) : undefined,
  )
  sendJson(response, 200, {
    access_token: issueAccessToken({
      identity,
      audience: AUTH.audience,
      scope: 'openid offline_access',
      clientId: AUTH.clientId,
    }),
  })
}

async function route(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? '/', URLS.auth)
  const key = `${request.method} ${url.pathname}`

  switch (key) {
    case 'GET /health':
      return sendJson(response, 200, { status: 'ready' })
    case 'GET /.well-known/openid-configuration':
      return sendJson(response, 200, {
        issuer: AUTH.issuer,
        authorization_endpoint: `${URLS.auth}/authorize`,
        token_endpoint: `${URLS.auth}/oauth/token`,
        jwks_uri: `${URLS.auth}/.well-known/jwks.json`,
        end_session_endpoint: `${URLS.auth}/v2/logout`,
        response_types_supported: ['code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
      })
    case 'GET /.well-known/jwks.json':
      return sendJson(response, 200, { keys: [publicJwk] })
    case 'GET /authorize':
      return handleAuthorize(url, response)
    case 'GET /authorize/complete':
      return handleAuthorizeComplete(url, response)
    case 'POST /oauth/token':
      return handleToken(request, response)
    case 'GET /v2/logout':
      return redirect(
        response,
        assertAppUrl(url.searchParams.get('returnTo'), 'returnTo'),
      )
    case 'POST /e2e/token':
      return handleTestToken(request, response)
    default:
      throw new HttpError(404, `no route for ${key}`)
  }
}

const server = createServer((request, response) => {
  // The SPA calls /oauth/token cross-origin with a custom Auth0-Client header.
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader(
    'Access-Control-Allow-Headers',
    request.headers['access-control-request-headers'] ?? '*',
  )
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  route(request, response).catch((error: unknown) => {
    const status = error instanceof HttpError ? error.status : 500
    const message = error instanceof Error ? error.message : String(error)
    if (status >= 500) log('auth', `error: ${message}`)
    sendJson(response, status, { error: 'mock_auth_error', message })
  })
})

onShutdown(() => {
  server.close()
})

server.listen(PORTS.auth, () => {
  log('auth', `mock identity provider ready on ${URLS.auth}`)
})

server.on('error', (error) => {
  process.stderr.write(`mock identity provider failed: ${error.message}\n`)
  process.exit(1)
})
