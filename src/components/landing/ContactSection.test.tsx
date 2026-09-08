import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ContactSection } from './ContactSection'
import { CONTACT_EMAIL } from './constants'

const writeTextMock = vi.fn()

describe('ContactSection', () => {
  beforeEach(() => {
    writeTextMock.mockReset()
    writeTextMock.mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: writeTextMock },
    })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('pokazuje adres e-mail jako link mailto', () => {
    render(<ContactSection />)

    const link = screen.getByRole('link', { name: CONTACT_EMAIL })
    expect(
      link.getAttribute('href')?.startsWith(`mailto:${CONTACT_EMAIL}`),
    ).toBe(true)
  })

  it('kopiuje adres e-mail do schowka i potwierdza', async () => {
    render(<ContactSection />)

    fireEvent.click(
      screen.getByRole('button', { name: /Skopiuj adres e-mail/ }),
    )

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(CONTACT_EMAIL)
    })
    expect(await screen.findByText('Skopiowano')).toBeDefined()
  })

  it('nie potwierdza kopiowania, gdy schowek odrzuci zapis', async () => {
    writeTextMock.mockRejectedValue(new Error('brak dostępu'))
    render(<ContactSection />)

    fireEvent.click(
      screen.getByRole('button', { name: /Skopiuj adres e-mail/ }),
    )

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(1)
    })
    expect(screen.queryByText('Skopiowano')).toBeNull()
  })
})
