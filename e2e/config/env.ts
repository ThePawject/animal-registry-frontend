import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

/**
 * Single source of truth for everything the E2E stack needs to agree on:
 * ports, URLs, credentials of the throwaway local services and timeouts.
 *
 * Every value can be overridden with an environment variable, so the suite can
 * run next to a regular dev setup (which uses the default 3000/5000 ports).
 */

const here = path.dirname(fileURLToPath(import.meta.url))

function numberFromEnv(name: string, fallback: number) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a number, got "${raw}"`)
  }
  return parsed
}

function stringFromEnv(name: string, fallback: string) {
  const raw = process.env[name]
  return raw === undefined || raw === '' ? fallback : raw
}

export const REPO_ROOT = path.resolve(here, '../..')
export const E2E_ROOT = path.resolve(here, '..')

export const IS_CI = Boolean(process.env.CI)

export const PORTS = {
  frontend: numberFromEnv('E2E_FRONTEND_PORT', 3100),
  backend: numberFromEnv('E2E_BACKEND_PORT', 5100),
  auth: numberFromEnv('E2E_AUTH_PORT', 4100),
  infraHealth: numberFromEnv('E2E_INFRA_HEALTH_PORT', 4110),
  mssql: numberFromEnv('E2E_MSSQL_PORT', 14330),
  azurite: numberFromEnv('E2E_AZURITE_PORT', 10100),
} as const

export const URLS = {
  frontend: `http://localhost:${PORTS.frontend}`,
  backend: `http://localhost:${PORTS.backend}`,
  auth: `http://localhost:${PORTS.auth}`,
  infraHealth: `http://localhost:${PORTS.infraHealth}`,
  azurite: `http://localhost:${PORTS.azurite}`,
} as const

export const HEALTH_URLS = {
  infra: `${URLS.infraHealth}/health`,
  auth: `${URLS.auth}/health`,
  /** Any protected endpoint answers 401 as soon as the API is up. */
  backend: `${URLS.backend}/animals`,
  frontend: URLS.frontend,
} as const

/** Mirrors `getAuthorizationParams()` in `src/lib/utils.ts`. */
export const AUTH = {
  /** The Auth0 SDK and the API both expect the issuer with a trailing slash. */
  issuer: `${URLS.auth}/`,
  audience: 'https://dev-ThePawject/',
  clientId: 'e2e-client',
  rolesClaim: 'https://ThePawject/roles',
  userIdClaim: 'https://ThePawject/user_id',
  emailClaim: 'https://ThePawject/email',
  shelterRolePrefix: 'Shelter_Access_',
} as const

/** Name of the Azurite account the backend bakes into every blob URL. */
export const BLOB = {
  accountName: 'devstoreaccount1',
  containerName: 'e2e-animals',
  /** Public, documented Azurite development key. Not a secret. */
  accountKey:
    'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
} as const

export const DATABASE = {
  name: 'AnimalRegistryE2E',
  /** Password of the disposable SQL Server container. Never used elsewhere. */
  saPassword: stringFromEnv('E2E_MSSQL_SA_PASSWORD', 'E2e-Local(!)Passw0rd'),
} as const

export const BACKEND_DIR = path.resolve(
  REPO_ROOT,
  stringFromEnv('E2E_BACKEND_DIR', '../animal-registry-backend'),
)

export const PATHS = {
  composeFile: path.join(E2E_ROOT, 'docker-compose.yml'),
  cacheDir: path.join(E2E_ROOT, '.cache'),
  signingKey: path.join(E2E_ROOT, '.cache', 'mock-auth-signing-key.pem'),
  artifactsDir: path.join(E2E_ROOT, '.artifacts'),
} as const

/**
 * The dev stack is known to freeze for up to two minutes (Vite re-optimising
 * dependencies, a cold .NET JIT, SQL Server waking up). Every wait that
 * depends on the stack uses `slow`, so such a freeze delays a test instead of
 * failing it. Passing assertions still resolve immediately.
 */
const slow = numberFromEnv('E2E_SLOW_TIMEOUT_MS', 150_000)

export const TIMEOUTS = {
  slow,
  /** Budget for one test: a couple of slow waits plus the actual work. */
  test: numberFromEnv('E2E_TEST_TIMEOUT_MS', slow * 3),
  /** Cold start of containers, `dotnet build` and Vite. */
  stackStart: numberFromEnv('E2E_STACK_START_TIMEOUT_MS', 10 * 60_000),
  /** UI-only state that never touches the network (dialogs, validation). */
  ui: 15_000,
  /** Used for "this must not happen" checks, where waiting is pure cost. */
  absent: 2_000,
} as const

export const COMPOSE_PROJECT = stringFromEnv(
  'E2E_COMPOSE_PROJECT',
  'animal-registry-e2e',
)

/** Keep containers (and their data) alive after the run for debugging. */
export const KEEP_INFRA = process.env.E2E_KEEP_INFRA === '1'

/** Timezone and locale the browser runs in; date assertions rely on them. */
export const BROWSER_LOCALE = 'pl-PL'
export const BROWSER_TIMEZONE = 'Europe/Warsaw'
