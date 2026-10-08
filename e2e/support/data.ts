import { BROWSER_LOCALE, BROWSER_TIMEZONE } from '../config/env.ts'
import { uniqueToken } from './users.ts'
import type { AnimalInput } from './api-client.ts'
import type { SpeciesKey } from './domain.ts'

export function unique(label: string) {
  return `${label} ${uniqueToken()}`
}

export function buildAnimal(overrides: Partial<AnimalInput> = {}): AnimalInput {
  return {
    species: 'dog',
    name: unique('Zwierzak'),
    ...overrides,
  }
}

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

export function daysAgo(days: number) {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: BROWSER_TIMEZONE,
  }).format(date)
}

export const tomorrow = () => daysAgo(-1)

export const currentYear = () => new Date().getUTCFullYear()

function formatIsoDate(isoDate: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(BROWSER_LOCALE, {
    timeZone: BROWSER_TIMEZONE,
    ...options,
  }).format(new Date(`${isoDate}T12:00:00Z`))
}

export function asTableDate(isoDate: string) {
  return formatIsoDate(isoDate, {})
}

export function asRegisterDate(isoDate: string) {
  return formatIsoDate(isoDate, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function asCardDate(isoDate: string) {
  return formatIsoDate(isoDate, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
