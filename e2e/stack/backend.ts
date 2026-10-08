import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {
  AUTH,
  BACKEND_DIR,
  BLOB,
  DATABASE,
  HEALTH_URLS,
  IS_CI,
  PORTS,
  TIMEOUTS,
  URLS,
} from '../config/env.ts'
import { log, onShutdown, waitForHttp } from './process.ts'

const projectDir = path.join(BACKEND_DIR, 'AnimalRegistry')

const backendEnv: NodeJS.ProcessEnv = {
  ...process.env,
  ASPNETCORE_ENVIRONMENT: 'Development',
  ASPNETCORE_URLS: URLS.backend,
  DOTNET_NOLOGO: '1',
  DOTNET_CLI_TELEMETRY_OPTOUT: '1',
  NuGetAudit: 'false',

  Logging__LogLevel__Default: 'Warning',
  'Logging__LogLevel__Microsoft.Hosting.Lifetime': 'Information',
  'Logging__LogLevel__Microsoft.EntityFrameworkCore': 'Error',

  Database__ConnectionString: [
    `Server=localhost,${PORTS.mssql}`,
    `Database=${DATABASE.name}`,
    'User Id=sa',
    `Password=${DATABASE.saPassword}`,
    'Encrypt=False',
    'TrustServerCertificate=True',
  ].join(';'),

  BlobStorage__ConnectionString: [
    'DefaultEndpointsProtocol=http',
    `AccountName=${BLOB.accountName}`,
    `AccountKey=${BLOB.accountKey}`,
    `BlobEndpoint=${URLS.azurite}/${BLOB.accountName}`,
  ].join(';'),
  BlobStorage__ContainerName: BLOB.containerName,
  BlobStorage__AccountName: BLOB.accountName,

  Auth0__Domain: AUTH.issuer,
  Auth0__Audience: AUTH.audience,
  Authentication__Schemes__Bearer__RequireHttpsMetadata: 'false',

  Cors__AllowedOrigins__0: URLS.frontend,
}

async function main() {
  if (!existsSync(projectDir)) {
    throw new Error(
      `Backend project not found at ${projectDir}. Clone animal-registry-backend next to this repository or set E2E_BACKEND_DIR.`,
    )
  }

  log('backend', 'waiting for the database and the mock identity provider')
  await Promise.all([
    waitForHttp(HEALTH_URLS.infra, {
      timeoutMs: TIMEOUTS.stackStart,
      scope: 'backend',
    }),
    waitForHttp(HEALTH_URLS.auth, {
      timeoutMs: TIMEOUTS.stackStart,
      scope: 'backend',
    }),
  ])

  log('backend', `starting ${projectDir} on ${URLS.backend}`)
  const child = spawn(
    'dotnet',
    [
      'run',
      '--project',
      projectDir,
      '--no-launch-profile',
      ...(IS_CI ? ['--no-build'] : []),
    ],
    { env: backendEnv, stdio: 'inherit' },
  )

  child.on('error', (error) => {
    process.stderr.write(
      `Could not run "dotnet". Is the .NET SDK installed? (${error.message})\n`,
    )
    process.exit(1)
  })
  child.on('exit', (code, signal) => {
    log('backend', `dotnet exited (code ${code}, signal ${signal})`)
    process.exit(code ?? 1)
  })

  onShutdown(
    () =>
      new Promise<void>((resolve) => {
        if (child.exitCode !== null) return resolve()
        child.once('exit', () => resolve())
        child.kill('SIGTERM')
      }),
  )
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`)
  process.exit(1)
})
