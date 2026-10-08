import { BROWSER_LOCALE, BROWSER_TIMEZONE } from '../config/env.ts'
import { uniqueToken } from './users.ts'
import type { AnimalInput } from './api-client.ts'
import type { SpeciesKey } from './domain.ts'

/**
 * Test data builders. Everything that ends up in the database gets a unique
 * token, so a test can always find its own records by text, no matter what
 * other tests (or earlier runs) left behind.
 */

/** A unique, recognisable value: `unique('Burek')` -> `Burek a1b2c3d4`. */
export function unique(label: string) {
  return `${label} ${uniqueToken()}`
}

/** A minimal valid animal; pass overrides for the fields a test is about. */
export function buildAnimal(overrides: Partial<AnimalInput> = {}): AnimalInput {
  return {
    species: 'dog',
    name: unique('Zwierzak'),
    ...overrides,
  }
}

/** `count` animals of one species, named `<prefix> 01`, `<prefix> 02`, ... */
export function buildAnimals(
  count: number,
  prefix: string,
  species: SpeciesKey = 'dog',
): Array<AnimalInput> {
  return Array.from({ length: count }, (_, index) => ({
    species,
    name: `${prefix} ${String(index + 1).padStart(2, '0')}`,
  }))
}

// -- dates --------------------------------------------------------------------

/**
 * Calendar date `days` before today, as `YYYY-MM-DD` in the browser's
 * timezone. Tests use relative dates so they never drift into "the future"
 * or out of a "last 30 days" report window.
 */
export function daysAgo(days: number) {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: BROWSER_TIMEZONE,
  }).format(date)
}

export const today = () => daysAgo(0)
export const tomorrow = () => daysAgo(-1)

/** Calendar year the backend uses for generated signatures. */
export const currentYear = () => new Date().getUTCFullYear()

function formatIsoDate(isoDate: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(BROWSER_LOCALE, {
    timeZone: BROWSER_TIMEZONE,
    ...options,
  }).format(new Date(`${isoDate}T12:00:00Z`))
}

/** How event and health record tables print a date, e.g. `5.03.2024`. */
export function asTableDate(isoDate: string) {
  return formatIsoDate(isoDate, {})
}

/** How the register prints a date, e.g. `5 mar 2024`. */
export function asRegisterDate(isoDate: string) {
  return formatIsoDate(isoDate, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** How the animal card prints a date, e.g. `05 marca 2024`. */
export function asCardDate(isoDate: string) {
  return formatIsoDate(isoDate, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
