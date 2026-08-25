import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { ContactSection } from './ContactSection'

const mutateAsyncMock = vi.fn()
const mutationState = {
  isPending: false,
  isError: false,
  isSuccess: false,
}

vi.mock('@/api/contact/queries', () => ({
  useSendContactInquiry: () => ({
    mutateAsync: mutateAsyncMock,
    ...mutationState,
  }),
}))

const fill = (label: string, value: string) => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('ContactSection', () => {
  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  beforeEach(() => {
    mutateAsyncMock.mockReset()
    mutateAsyncMock.mockResolvedValue(undefined)
    mutationState.isPending = false
    mutationState.isError = false
    mutationState.isSuccess = false
  })

  afterEach(cleanup)

  it('nie wysyła zapytania, dopóki wymagane pola są puste', async () => {
    render(<ContactSection />)

    fireEvent.click(screen.getByRole('button', { name: /Wyślij zapytanie/ }))

    await waitFor(() => {
      expect(screen.getByText('Podaj nazwę schroniska')).toBeDefined()
    })
    expect(screen.getByText('Podaj osobę kontaktową')).toBeDefined()
    expect(screen.getByText('Podaj adres e-mail')).toBeDefined()
    expect(
      screen.getByText('Zgoda jest niezbędna, aby odpowiedzieć'),
    ).toBeDefined()
    expect(mutateAsyncMock).not.toHaveBeenCalled()
  })

  it('waliduje format adresu e-mail', async () => {
    render(<ContactSection />)

    fill('E-mail *', 'to-nie-jest-email')
    fireEvent.click(screen.getByRole('button', { name: /Wyślij zapytanie/ }))

    await waitFor(() => {
      expect(screen.getByText('Podaj poprawny adres e-mail')).toBeDefined()
    })
    expect(mutateAsyncMock).not.toHaveBeenCalled()
  })

  it('wysyła komplet danych po poprawnym wypełnieniu', async () => {
    render(<ContactSection />)

    fill('Nazwa schroniska *', 'Schronisko w Testowicach')
    fill('Osoba kontaktowa *', 'Jan Kowalski')
    fill('E-mail *', 'kontakt@schronisko.pl')
    fill('Telefon', '111222333')
    fill('Wiadomość', 'Chcielibyśmy zobaczyć demo.')
    fireEvent.click(screen.getByRole('checkbox'))

    fireEvent.click(screen.getByRole('button', { name: /Wyślij zapytanie/ }))

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
    })
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      shelterName: 'Schronisko w Testowicach',
      contactPerson: 'Jan Kowalski',
      email: 'kontakt@schronisko.pl',
      phone: '111222333',
      message: 'Chcielibyśmy zobaczyć demo.',
      consent: true,
      _honey: '',
    })
  })

  it('po nieudanej wysyłce pokazuje awaryjny kontakt mailowy', () => {
    mutationState.isError = true
    render(<ContactSection />)

    expect(screen.getByText('Nie udało się wysłać wiadomości.')).toBeDefined()
    const fallback = screen
      .getAllByRole('link')
      .find((link) =>
        link
          .getAttribute('href')
          ?.startsWith('mailto:kontakt@mojeschronisko.pl'),
      )
    expect(fallback).toBeDefined()
  })
})
