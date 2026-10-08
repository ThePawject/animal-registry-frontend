import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

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
  backend: `${URLS.backend}/animals`,
  frontend: URLS.frontend,
} as const

export const AUTH = {
  issuer: `${URLS.auth}/`,
  audience: 'https://dev-ThePawject/',
  clientId: 'e2e-client',
  rolesClaim: 'https://ThePawject/roles',
  userIdClaim: 'https://ThePawject/user_id',
  emailClaim: 'https://ThePawject/email',
  shelterRolePrefix: 'Shelter_Access_',
} as const

export const BLOB = {
  accountName: 'devstoreaccount1',
  containerName: 'e2e-animals',
  accountKey:
    'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
} as const

export const DATABASE = {
  name: 'AnimalRegistryE2E',
  saPassword: stringFromEnv('E2E_MSSQL_SA_PASSWORD', 'E2e-Local(!)Passw0rd'),
} as const

export const BACKEND_DIR = path.resolve(
  REPO_ROOT,
  stringFromEnv('E2E_BACKEND_DIR', '../animal-registry-backend'),
)

export const PATHS = {
  composeFile: path.join(E2E_ROOT, 'docker-compose.yml'),
  signingKey: path.join(E2E_ROOT, '.cache', 'mock-auth-signing-key.pem'),
  artifactsDir: path.join(E2E_ROOT, '.artifacts'),
  frontendBuild: path.join(E2E_ROOT, '.artifacts', 'frontend'),
} as const

const slow = numberFromEnv('E2E_SLOW_TIMEOUT_MS', 30_000)

export const TIMEOUTS = {
  slow,
  test: numberFromEnv('E2E_TEST_TIMEOUT_MS', slow * 4),
  stackStart: numberFromEnv('E2E_STACK_START_TIMEOUT_MS', 10 * 60_000),
  ui: 15_000,
  settle: 500,
} as const

function workersFromEnv(): number | string {
  const raw = process.env.E2E_WORKERS
  if (raw === undefined || raw === '') return 3
  return /^\d+%$/.test(raw) ? raw : numberFromEnv('E2E_WORKERS', 3)
}

export const WORKERS = workersFromEnv()

export const COMPOSE_PROJECT = stringFromEnv(
  'E2E_COMPOSE_PROJECT',
  'animal-registry-e2e',
)

export const KEEP_INFRA = process.env.E2E_KEEP_INFRA === '1'

export const BROWSER_LOCALE = 'pl-PL'
export const BROWSER_TIMEZONE = 'Europe/Warsaw'
