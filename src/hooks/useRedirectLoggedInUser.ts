import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from '@tanstack/react-router'

const PANEL_PATH = '/panel' as const

function hasStoredAuth0Session() {
  try {
    return Object.keys(window.localStorage).some((key) =>
      key.startsWith('@@auth0spajs@@'),
    )
  } catch {
    return false
  }
}

function isAuth0Callback() {
  try {
    const params = new URLSearchParams(window.location.search)
    return params.has('code') && params.has('state')
  } catch {
    return false
  }
}

export function useRedirectLoggedInUser() {
  const { isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()
  const [expectsSession] = useState(
    () => hasStoredAuth0Session() || isAuth0Callback(),
  )

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: PANEL_PATH, replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  return (isLoading && expectsSession) || (!isLoading && isAuthenticated)
}
