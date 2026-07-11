import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import EventReportModal from './EventReportModal'
import type { EventReportParams } from '@/api/reports/types'

const mutateMock = vi.fn()

vi.mock('../AnimalTable', () => ({
  createAndDownloadReport: vi.fn(),
}))

vi.mock('@/api/reports/queries', () => ({
  useReports: vi.fn(() => ({
    mutate: mutateMock,
    isPending: false,
    error: null,
  })),
}))

describe('EventReportModal', () => {
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
    mutateMock.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('submits selected default periods', () => {
    render(<EventReportModal open onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Generuj raport' }))

    expect(mutateMock).toHaveBeenCalledWith({
      periods: ['Week', 'Month', 'Quarter'],
      customStartDate: undefined,
      customEndDate: undefined,
    } satisfies EventReportParams)
  })

  it('requires at least one selected period', () => {
    render(<EventReportModal open onClose={vi.fn()} />)

    fireEvent.click(screen.getByLabelText('Ostatni tydzień'))
    fireEvent.click(screen.getByLabelText('Ostatni miesiąc'))
    fireEvent.click(screen.getByLabelText('Ostatni kwartał'))
    fireEvent.click(screen.getByRole('button', { name: 'Generuj raport' }))

    expect(
      screen.getByText('Wybierz przynajmniej jeden okres raportu.'),
    ).toBeTruthy()
    expect(mutateMock).not.toHaveBeenCalled()
  })

  it('requires dates for custom period', () => {
    render(<EventReportModal open onClose={vi.fn()} />)

    fireEvent.click(screen.getByLabelText('Własny zakres dat'))
    fireEvent.click(screen.getByRole('button', { name: 'Generuj raport' }))

    expect(
      screen.getByText('Wybierz datę początkową i końcową dla własnego zakresu.'),
    ).toBeTruthy()
    expect(mutateMock).not.toHaveBeenCalled()
  })

  it('submits custom period with dates', () => {
    render(<EventReportModal open onClose={vi.fn()} />)

    fireEvent.click(screen.getByLabelText('Własny zakres dat'))
    fireEvent.change(screen.getByLabelText('Data początkowa'), {
      target: { value: '2026-06-01' },
    })
    fireEvent.change(screen.getByLabelText('Data końcowa'), {
      target: { value: '2026-06-30' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Generuj raport' }))

    expect(mutateMock).toHaveBeenCalledWith({
      periods: ['Week', 'Month', 'Quarter', 'Custom'],
      customStartDate: '2026-06-01',
      customEndDate: '2026-06-30',
    } satisfies EventReportParams)
  })

  it('allows unchecking custom period after selecting dates', () => {
    render(<EventReportModal open onClose={vi.fn()} />)

    fireEvent.click(screen.getByLabelText('Własny zakres dat'))
    fireEvent.change(screen.getByLabelText('Data początkowa'), {
      target: { value: '2026-06-01' },
    })
    fireEvent.change(screen.getByLabelText('Data końcowa'), {
      target: { value: '2026-06-30' },
    })

    fireEvent.click(screen.getByLabelText('Własny zakres dat'))
    fireEvent.click(screen.getByRole('button', { name: 'Generuj raport' }))

    expect(screen.queryByLabelText('Data początkowa')).toBeNull()
    expect(mutateMock).toHaveBeenCalledWith({
      periods: ['Week', 'Month', 'Quarter'],
      customStartDate: undefined,
      customEndDate: undefined,
    } satisfies EventReportParams)
  })
})
