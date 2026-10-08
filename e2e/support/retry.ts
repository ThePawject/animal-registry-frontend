import { setTimeout as sleep } from 'node:timers/promises'
import { TIMEOUTS } from '../config/env.ts'

type RetryOptions = {
  /** What is being attempted; used in the error when every attempt fails. */
  description: string
  /** Total time budget across all attempts. */
  timeoutMs?: number
  /** Pause between attempts; grows a little each time. */
  intervalMs?: number
  /** Return false to rethrow immediately (e.g. a genuine 4xx). */
  shouldRetry?: (error: unknown) => boolean
}

/**
 * Runs `action` until it succeeds or the time budget is used up.
 *
 * Meant for operations that are safe to repeat and that only fail because
 * the local stack is momentarily busy (a restarting dev server, a cold
 * endpoint). Not a substitute for Playwright's auto-waiting assertions.
 */
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
