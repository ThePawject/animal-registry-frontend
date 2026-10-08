import { setTimeout as sleep } from 'node:timers/promises'
import { TIMEOUTS } from '../config/env.ts'

type RetryOptions = {
  description: string
  timeoutMs?: number
  intervalMs?: number
  shouldRetry?: (error: unknown) => boolean
}

export async function retry<T>(
  action: (attempt: number) => Promise<T>,
  {
    description,
    timeoutMs = TIMEOUTS.slow,
    intervalMs = 500,
    shouldRetry = () => true,
  }: RetryOptions,
): Promise<T> {
  const deadline = Date.now() + timeoutMs
  let attempt = 0
  let lastError: unknown

  for (;;) {
    attempt++
    try {
      return await action(attempt)
    } catch (error) {
      lastError = error
      if (!shouldRetry(error)) throw error
    }

    const pause = Math.min(intervalMs * attempt, 5_000)
    if (Date.now() + pause >= deadline) break
    await sleep(pause)
  }

  const reason =
    lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(
    `${description} did not succeed within ${Math.round(timeoutMs / 1000)}s after ${attempt} attempt(s): ${reason}`,
    { cause: lastError },
  )
}
