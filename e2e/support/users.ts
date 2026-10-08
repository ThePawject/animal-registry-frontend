import { randomBytes } from 'node:crypto'
import { AUTH } from '../config/env.ts'

export type TestUser = {
  id: string
  email: string
  roles: Array<string>
  shelterId: string | null
  shelterName: string | null
}

const LIGATURE_FREE_ALPHABET = 'abcdeghkmnopqrsuvwxyz0123456789'

export function uniqueToken(length = 8) {
  return Array.from(
    randomBytes(length),
    (byte) => LIGATURE_FREE_ALPHABET[byte % LIGATURE_FREE_ALPHABET.length],
  ).join('')
}

function buildUser(
  label: string,
  roles: Array<string>,
  shelterId: string | null,
) {
  const token = uniqueToken()
  const email = `${label}.${token}@e2e.test`
  return {
    id: `e2e|${label}-${token}`,
    email,
    roles,
    shelterId,
    shelterName: shelterId ? shelterId.replace(/_/g, ' ') : null,
  } satisfies TestUser
}

export function createShelterUser(label = 'staff') {
  const shelterId = `E2E_${uniqueToken()}`
  return buildUser(label, [`${AUTH.shelterRolePrefix}${shelterId}`], shelterId)
}

export function createColleagueOf(colleague: TestUser, label = 'colleague') {
  return buildUser(label, [...colleague.roles], colleague.shelterId)
}

export function createUserWithoutRole(label = 'newcomer') {
  return buildUser(label, [], null)
}
