import { describe, expect, it } from 'vitest'
import { decodeJwt, getRoles, getShelterName } from './utils'

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
    // "?" and "~" encode to "_" and "-", which plain base64 does not know.
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
