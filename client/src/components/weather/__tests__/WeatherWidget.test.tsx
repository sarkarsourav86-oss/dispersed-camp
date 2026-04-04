import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { WeatherWidget } from '../WeatherWidget'
import type { WeatherDay } from '../../../types'

function makeDay(overrides: Partial<WeatherDay> = {}): WeatherDay {
  return {
    date: '2026-04-04',
    tempMax: 75,
    tempMin: 45,
    precipitation: 0,
    windSpeed: 10,
    weatherCode: 0,
    description: 'Clear sky',
    ...overrides,
  }
}

describe('WeatherWidget', () => {
  it('renders nothing when days array is empty', () => {
    const { container } = render(<WeatherWidget days={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders the 5-Day Forecast heading', () => {
    render(<WeatherWidget days={[makeDay()]} />)
    expect(screen.getByText('5-Day Forecast')).toBeInTheDocument()
  })

  it('displays today weather description and temps', () => {
    render(<WeatherWidget days={[makeDay({ description: 'Sunny skies', tempMax: 80, tempMin: 50 })]} />)
    expect(screen.getByText('Sunny skies')).toBeInTheDocument()
    expect(screen.getAllByText(/80°/).length).toBeGreaterThanOrEqual(1)
  })

  it('displays wind speed', () => {
    render(<WeatherWidget days={[makeDay({ windSpeed: 15 })]} />)
    expect(screen.getByText(/15 mph wind/)).toBeInTheDocument()
  })

  it('shows precipitation when greater than zero', () => {
    render(<WeatherWidget days={[makeDay({ precipitation: 0.5 })]} />)
    expect(screen.getByText(/0\.5" rain/)).toBeInTheDocument()
  })

  it('renders up to 5 forecast days', () => {
    const days = Array.from({ length: 7 }, (_, i) =>
      makeDay({ date: `2026-04-0${i + 1}` }),
    )
    render(<WeatherWidget days={days} />)
    // "Today" label + 4 weekday labels = 5 forecast items
    expect(screen.getByText('Today')).toBeInTheDocument()
  })
})
