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
