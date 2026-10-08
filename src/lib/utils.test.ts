import { describe, expect, it } from 'vitest'
import {
  decodeJwt,
  getRoles,
  getShelterName,
  isFutureDate,
  todayIsoDate,
} from './utils'

const ROLES_CLAIM = 'https://ThePawject/roles'

function base64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function tokenWith(payload: Record<string, unknown>) {
  return `${base64Url('{"alg":"RS256"}')}.${base64Url(JSON.stringify(payload))}.signature`
}

describe('decodeJwt', () => {
  it('reads the payload of a token', () => {
    const payload = { sub: 'auth0|123', [ROLES_CLAIM]: ['Shelter_Access_Azyl'] }

    expect(decodeJwt(tokenWith(payload))).toEqual(payload)
  })

  it('reads payloads whose encoding uses the base64url alphabet', () => {
    const payload = { redirect: 'https://example.com/?a=1', note: '~~~>>>???' }
    const token = tokenWith(payload)

    expect(token.split('.')[1]).toMatch(/[-_]/)
    expect(decodeJwt(token)).toEqual(payload)
  })

  it('reads non-ASCII characters', () => {
    const payload = { name: 'Żaneta Brzęczyszczykiewicz', city: 'Łódź' }

    expect(decodeJwt(tokenWith(payload))).toEqual(payload)
  })

  it('returns null for something that is not a token', () => {
    expect(decodeJwt('not-a-token')).toBeNull()
  })
})

describe('roles from a token', () => {
  it('derives the shelter name from the access role', () => {
    const decoded = decodeJwt(
      tokenWith({ [ROLES_CLAIM]: ['Shelter_Access_Schronisko_Łódź'] }),
    )

    expect(getRoles(decoded)).toEqual(['Shelter_Access_Schronisko_Łódź'])
    expect(getShelterName(decoded)).toBe('Schronisko Łódź')
  })
})

describe('dates', () => {
  const pad = (value: number) => String(value).padStart(2, '0')
  const isoDate = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const daysFromNow = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return isoDate(date)
  }

  it('reads today from the local calendar', () => {
    expect(todayIsoDate()).toBe(isoDate(new Date()))
  })

  it('accepts today and the past', () => {
    expect(isFutureDate(todayIsoDate())).toBe(false)
    expect(isFutureDate(daysFromNow(-1))).toBe(false)
    expect(isFutureDate('2000-01-01T00:00:00Z')).toBe(false)
  })

  it('rejects tomorrow and far-future years', () => {
    expect(isFutureDate(daysFromNow(1))).toBe(true)
    expect(isFutureDate('12345-01-01')).toBe(true)
  })
})
