import { describe, expect, it } from 'vitest'
import { validateMunicipalityName } from './validation'
import type { Municipality } from './types'

const municipality = (
  id: string,
  name: string,
  isArchived = false,
): Municipality => ({ id, name, isArchived, createdOn: '2026-01-01' })

const municipalities = [
  municipality('1', 'Kórnik'),
  municipality('2', 'Śrem', true),
]

describe('validateMunicipalityName', () => {
  it('requires a name', () => {
    expect(validateMunicipalityName('   ', municipalities)).toBe(
      'Nazwa gminy jest wymagana',
    )
  })

  it('limits the length', () => {
    expect(validateMunicipalityName('a'.repeat(201), [])).toBe(
      'Nazwa gminy może mieć maksymalnie 200 znaków',
    )
  })

  it('rejects an active duplicate regardless of case and spaces', () => {
    expect(validateMunicipalityName(' KÓRNIK ', municipalities)).toBe(
      'Gmina „KÓRNIK” jest już na liście',
    )
  })

  it('points to restoring an archived duplicate', () => {
    expect(validateMunicipalityName('śrem', municipalities)).toBe(
      'Gmina „śrem” jest już na liście zarchiwizowanych. Przywróć ją zamiast tworzyć nową.',
    )
  })

  it('lets the edited municipality keep its own name', () => {
    expect(
      validateMunicipalityName('kórnik', municipalities, '1'),
    ).toBeUndefined()
  })

  it('accepts a new name', () => {
    expect(validateMunicipalityName('Mosina', municipalities)).toBeUndefined()
  })
})
