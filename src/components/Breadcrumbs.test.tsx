import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'

const matches: Array<{
  pathname: string
  loaderData?: { title?: string; href?: string }
}> = []

vi.mock('@tanstack/react-router', () => ({
  useMatches: () => matches,
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

const setMatches = (next: typeof matches) => {
  matches.length = 0
  matches.push(...next)
}

describe('Breadcrumbs', () => {
  afterEach(cleanup)

  it('kieruje okruszek listy zwierząt do panelu, a nie do landinga na /', () => {
    setMatches([
      {
        pathname: '/',
        loaderData: { title: 'Lista Zwierząt', href: '/panel' },
      },
      { pathname: '/animal/42', loaderData: { title: 'WAFEL 3894' } },
    ])

    render(<Breadcrumbs />)

    const link = screen.getByRole('link', { name: 'Lista Zwierząt' })
    expect(link.getAttribute('href')).toBe('/panel')
    expect(screen.getByText('WAFEL 3894')).toBeDefined()
  })

  it('używa pathname, gdy trasa nie podaje własnego adresu', () => {
    setMatches([
      { pathname: '/animal/42', loaderData: { title: 'WAFEL 3894' } },
      {
        pathname: '/animal/42/events',
        loaderData: { title: 'Wydarzenia' },
      },
    ])

    render(<Breadcrumbs />)

    const link = screen.getByRole('link', { name: 'WAFEL 3894' })
    expect(link.getAttribute('href')).toBe('/animal/42')
  })
})
