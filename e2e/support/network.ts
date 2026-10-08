import { expect } from '@playwright/test'
import { TIMEOUTS, URLS } from '../config/env.ts'
import type { Page, Request } from '@playwright/test'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

type BackendRequest = {
  method: Method
  pathname: string | RegExp
}

function matches(request: Request, { method, pathname }: BackendRequest) {
  const url = new URL(request.url())
  if (url.origin !== URLS.backend || request.method() !== method) return false
  return typeof pathname === 'string'
    ? url.pathname === pathname
    : pathname.test(url.pathname)
}

export async function failBackendRequests(page: Page, target: BackendRequest) {
  await page.route(`${URLS.backend}/**`, (route) =>
    matches(route.request(), target)
      ? route.fulfill({
          status: 500,
          headers: { 'Access-Control-Allow-Origin': URLS.frontend },
          body: 'Simulated backend failure',
        })
      : route.fallback(),
  )
}

export async function forbidBackendRequests(
  page: Page,
  target: BackendRequest,
) {
  const sent: Array<string> = []
  await page.route(`${URLS.backend}/**`, (route) => {
    if (!matches(route.request(), target)) return route.fallback()
    sent.push(`${route.request().method()} ${route.request().url()}`)
    return route.abort()
  })
  return {
    async expectNoneSent() {
      await page.waitForTimeout(TIMEOUTS.settle)
      expect(sent, 'the app must not have called the backend').toEqual([])
    },
  }
}

export function waitForBackendRequest(page: Page, target: BackendRequest) {
  return page.waitForRequest((request) => matches(request, target))
}

export function waitForBackendResponse(page: Page, target: BackendRequest) {
  return page.waitForResponse((response) => matches(response.request(), target))
}

export function queryValues(request: Request, key: string) {
  return new URL(request.url()).searchParams.getAll(key)
}
