import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRedirectLoggedInUser } from './useRedirectLoggedInUser'

const navigateMock = vi.fn()
const auth0State = { isAuthenticated: false, isLoading: true }

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => auth0State,
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}))

const setLocation = (search: string) => {
  window.history.replaceState({}, '', `/${search}`)
}

const stubLocalStorage = (entries: Record<string, string> = {}) => {
  vi.stubGlobal('localStorage', { ...entries })
}

describe('useRedirectLoggedInUser', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    stubLocalStorage()
    setLocation('')
    auth0State.isAuthenticated = false
    auth0State.isLoading = true
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    setLocation('')
  })

  it('pokazuje landing anonimowemu odwiedzającemu, gdy Auth0 jeszcze się inicjalizuje', () => {
    const { result } = renderHook(() => useRedirectLoggedInUser())

    expect(result.current).toBe(false)
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('nie przekierowuje, gdy sprawdzanie sesji skończyło się brakiem logowania', () => {
    auth0State.isLoading = false

    const { result } = renderHook(() => useRedirectLoggedInUser())

    expect(result.current).toBe(false)
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('czeka ze spinnerem, gdy w localStorage jest sesja Auth0', () => {
    stubLocalStorage({ '@@auth0spajs@@::abc::default::openid': '{}' })

    const { result } = renderHook(() => useRedirectLoggedInUser())

    expect(result.current).toBe(true)
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('czeka ze spinnerem podczas powrotu z logowania Auth0', () => {
    setLocation('?code=abc&state=xyz')

    const { result } = renderHook(() => useRedirectLoggedInUser())

    expect(result.current).toBe(true)
  })

  it('przekierowuje zalogowanego do tabeli zwierząt, podmieniając wpis w historii', () => {
    auth0State.isLoading = false
    auth0State.isAuthenticated = true

    const { result } = renderHook(() => useRedirectLoggedInUser())

    expect(navigateMock).toHaveBeenCalledWith({ to: '/panel', replace: true })
    expect(result.current).toBe(true)
  })

  it('wraca do landinga, gdy sesja z localStorage okazała się nieważna', () => {
    stubLocalStorage({ '@@auth0spajs@@::abc::default::openid': '{}' })

    const { result, rerender } = renderHook(() => useRedirectLoggedInUser())
    expect(result.current).toBe(true)

    auth0State.isLoading = false
    rerender()

    expect(result.current).toBe(false)
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
