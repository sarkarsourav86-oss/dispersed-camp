import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OfflineBanner } from '../OfflineBanner'

describe('OfflineBanner', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { ...navigator, onLine: true })
  })

  it('renders nothing when online', () => {
    const { container } = render(<OfflineBanner />)
    expect(container.innerHTML).toBe('')
  })

  it('renders banner when offline', () => {
    vi.stubGlobal('navigator', { ...navigator, onLine: false })
    render(<OfflineBanner />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
  })

  it('shows banner when going offline', () => {
    render(<OfflineBanner />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('hides banner when coming back online', () => {
    vi.stubGlobal('navigator', { ...navigator, onLine: false })
    render(<OfflineBanner />)
    expect(screen.getByRole('alert')).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
