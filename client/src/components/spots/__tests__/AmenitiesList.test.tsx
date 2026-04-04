import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AmenitiesList } from '../AmenitiesList'

describe('AmenitiesList', () => {
  it('renders nothing when no matching amenities', () => {
    const { container } = render(<AmenitiesList tags={{ unknown_key: 'yes' }} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing for empty tags', () => {
    const { container } = render(<AmenitiesList tags={{}} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders matching amenities', () => {
    render(<AmenitiesList tags={{ drinking_water: 'yes', fire_pit: 'yes' }} />)
    expect(screen.getByText('Amenities')).toBeInTheDocument()
    expect(screen.getByText('Drinking water')).toBeInTheDocument()
    expect(screen.getByText('Fire pit')).toBeInTheDocument()
  })

  it('applies line-through style for "no" values', () => {
    render(<AmenitiesList tags={{ drinking_water: 'no' }} />)
    const badge = screen.getByText('Drinking water').closest('span')
    expect(badge?.className).toContain('line-through')
  })

  it('shows custom value in parentheses for non-boolean values', () => {
    render(<AmenitiesList tags={{ capacity: '25' }} />)
    expect(screen.getByText('Sites')).toBeInTheDocument()
    expect(screen.getByText('(25)')).toBeInTheDocument()
  })

  it('does not show parentheses for "yes" values', () => {
    render(<AmenitiesList tags={{ drinking_water: 'yes' }} />)
    expect(screen.queryByText('(yes)')).not.toBeInTheDocument()
  })
})
