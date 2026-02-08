import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function decodeJwt(token: string) {
  try {
    const payload = token.split('.')[1]
    const decodedPayload = atob(payload)
    return JSON.parse(decodedPayload)
  } catch (error) {
    console.error('Invalid JWT token:', error)
    return null
  }
}

export function getShelterName(
  decodedToken: Record<string, any>,
): string | null {
  const roles = decodedToken['https://ThePawject/roles']
  const shelterName = roles.find((role: string) =>
    role.startsWith('Shelter_Access_'),
  )
  return shelterName ? shelterName.replace('Shelter_Access_', '') : null
}

export function getRoles(decodedToken: Record<string, any>): Array<string> {
  return decodedToken['https://ThePawject/roles'] || []
}

export function hasAtLeastOneRole(roles: Array<string>): boolean {
  return !Array.isArray(roles) || roles.length === 0
}

export const origin =
  typeof window !== 'undefined' ? window.location.origin : null

export function getOriginHomePage() {
  if (!origin) return null
  return `${origin}/animal-registry-frontend/`
}

export function getOriginNoAccessPage() {
  if (!origin) return null
  return `${origin}/animal-registry-frontend/no-access`
}

export function getAuthorizationParams() {
  return {
    scope: 'openid offline_access',
    audience: 'https://dev-ThePawject/',
  }
}

export function transformBlobUrl(blobUrl: string): string {
  const newBlobUrl = blobUrl.replace(
    'kundelek-azurite-1:10000',
    '91.189.217.30:10000',
  )
  return newBlobUrl
}
