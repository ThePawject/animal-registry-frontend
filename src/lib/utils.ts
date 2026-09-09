import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export const genericErrorMessage =
  'Wystąpił nieoczekiwany błąd. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export const PINNED_COLUMN_ID = 'actions'

export function pinnedCellClass(
  columnId: string | undefined,
  hasHiddenContent = false,
) {
  if (columnId !== PINNED_COLUMN_ID) return undefined

  return cn(
    'sticky right-0 z-10 bg-inherit',
    'before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-2.5',
    'before:bg-gradient-to-l before:from-black/18 before:to-transparent dark:before:from-black/60',
    'before:opacity-0 before:transition-opacity before:duration-200',
    hasHiddenContent && 'before:opacity-100',
  )
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
  return shelterName
    ? shelterName.replace('Shelter_Access_', '').replace(/_/g, ' ')
    : null
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
  return `${origin}`
}

export function getOriginNoAccessPage() {
  if (!origin) return null
  return `${origin}no-access`
}

export function getAuthorizationParams() {
  return {
    scope: 'openid offline_access',
    audience: 'https://dev-ThePawject/',
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function rotateFile(
  file: File,
  degrees: 90 | 180 | 270,
): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const { width: w, height: h } = bitmap
  const canvas = document.createElement('canvas')
  const swapDimensions = degrees === 90 || degrees === 270
  canvas.width = swapDimensions ? h : w
  canvas.height = swapDimensions ? w : h
  const ctx = canvas.getContext('2d')!
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((degrees * Math.PI) / 180)
  ctx.drawImage(bitmap, -w / 2, -h / 2)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed'))
          return
        }
        resolve(new File([blob], file.name, { type: file.type }))
      },
      file.type,
      0.92,
    )
  })
}
