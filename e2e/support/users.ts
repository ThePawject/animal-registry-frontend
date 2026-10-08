import { randomBytes } from 'node:crypto'
import { AUTH } from '../config/env.ts'

/**
 * Test identities. The mock identity provider signs in whoever a test
 * describes, so users are plain values and never have to be provisioned.
 *
 * A "shelter" is nothing more than a role name: the backend derives the
 * tenant from `Shelter_Access_<id>`. Giving every test (or worker) its own
 * random shelter id is what keeps tests independent of each other and of
 * leftovers from previous runs.
 */

export type TestUser = {
  id: string
  email: string
  roles: Array<string>
  /** Tenant id as the backend sees it; `null` for users without access. */
  shelterId: string | null
  /** Shelter name as the header renders it ("Panel <name>"). */
  shelterName: string | null
}

/** Short random token made only of characters that are safe everywhere. */
export function uniqueToken(length = 8) {
  return randomBytes(length).toString('hex').slice(0, length)
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

/** A staff member of a brand new, empty shelter. */
export function createShelterUser(label = 'staff') {
  const shelterId = `E2E_${uniqueToken()}`
  return buildUser(label, [`${AUTH.shelterRolePrefix}${shelterId}`], shelterId)
}

/** Another staff member of the shelter `colleague` already belongs to. */
export function createColleagueOf(colleague: TestUser, label = 'colleague') {
  return buildUser(label, [...colleague.roles], colleague.shelterId)
}

/** A freshly registered account an administrator has not set up yet. */
export function createUserWithoutRole(label = 'newcomer') {
  return buildUser(label, [], null)
}
