import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import process from 'node:process'
import {
  COMPOSE_PROJECT,
  DATABASE,
  KEEP_INFRA,
  PATHS,
  PORTS,
} from '../config/env.ts'
import { log, onShutdown } from './process.ts'

const composeEnv = {
  ...process.env,
  E2E_MSSQL_SA_PASSWORD: DATABASE.saPassword,
  E2E_MSSQL_PORT: String(PORTS.mssql),
  E2E_AZURITE_PORT: String(PORTS.azurite),
}

function compose(args: Array<string>) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      'docker',
      ['compose', '-p', COMPOSE_PROJECT, '-f', PATHS.composeFile, ...args],
      { env: composeEnv, stdio: 'inherit' },
    )
    child.on('error', (error) =>
      reject(
        new Error(
          `Could not run "docker compose". Is Docker installed and running? (${error.message})`,
        ),
      ),
    )
    child.on('exit', (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(`docker compose ${args.join(' ')} exited with ${code}`),
          ),
    )
  })
}

async function main() {
  log('infra', 'starting SQL Server and Azurite containers')
  await compose(['up', '--detach', '--wait', '--wait-timeout', '300'])

  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ status: 'ready' }))
  })

  onShutdown(async () => {
    server.close()
    if (KEEP_INFRA) {
      log('infra', 'E2E_KEEP_INFRA=1, leaving containers running')
      return
    }
    log('infra', 'removing containers')
    await compose(['down', '--volumes', '--remove-orphans'])
  })

  server.on('error', (error) => {
    process.stderr.write(`infra health server failed: ${error.message}\n`)
    const cleanup = KEEP_INFRA
      ? Promise.resolve()
      : compose(['down', '--volumes', '--remove-orphans'])
    cleanup.catch(() => undefined).finally(() => process.exit(1))
  })

  server.listen(PORTS.infraHealth, () => {
    log('infra', `ready (health on port ${PORTS.infraHealth})`)
  })
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`)
  process.exit(1)
})
