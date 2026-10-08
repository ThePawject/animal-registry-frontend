import process from 'node:process'
import { setTimeout as sleep } from 'node:timers/promises'

export function log(scope: string, message: string) {
  process.stdout.write(`[e2e:${scope}] ${message}\n`)
}

type WaitForHttpOptions = {
  timeoutMs: number
  isReady?: (status: number) => boolean
  intervalMs?: number
  scope?: string
}

export async function waitForHttp(
  url: string,
  {
    timeoutMs,
    isReady = (status) => status < 500,
    intervalMs = 1_000,
    scope = 'stack',
  }: WaitForHttpOptions,
) {
  const deadline = Date.now() + timeoutMs
  let lastFailure = 'no attempt made'
  let attempt = 0

  while (Date.now() < deadline) {
    attempt++
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(Math.min(10_000, timeoutMs)),
      })
      await response.body?.cancel()
      if (isReady(response.status)) return
      lastFailure = `HTTP ${response.status}`
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error)
    }
    if (attempt % 15 === 0) {
      log(scope, `still waiting for ${url} (${lastFailure})`)
    }
    await sleep(intervalMs)
  }

  throw new Error(
    `${url} was not ready within ${Math.round(timeoutMs / 1000)}s (last failure: ${lastFailure})`,
  )
}

export function onShutdown(cleanup: () => Promise<void> | void) {
  let shuttingDown = false

  const handle = (signal: NodeJS.Signals) => {
    if (shuttingDown) return
    shuttingDown = true
    Promise.resolve()
      .then(cleanup)
      .catch((error: unknown) => {
        process.stderr.write(`cleanup after ${signal} failed: ${error}\n`)
      })
      .finally(() => process.exit(0))
  }

  process.on('SIGTERM', handle)
  process.on('SIGINT', handle)
}
