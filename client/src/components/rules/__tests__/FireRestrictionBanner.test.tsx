import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FireRestrictionBanner } from '../FireRestrictionBanner'
import type { FireRestrictionResult } from '../../../types'

describe('FireRestrictionBanner', () => {
  it('renders nothing when no restrictions active', () => {
    const restriction: FireRestrictionResult = {
      restrictionsActive: false,
      level: 'none',
    }
    const { container } = render(<FireRestrictionBanner restriction={restriction} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders alert when restrictions are active', () => {
    const restriction: FireRestrictionResult = {
      restrictionsActive: true,
      level: 'stage1',
      message: 'Fire activity detected',
      sourceUrl: 'https://example.com/fire',
    }
    render(<FireRestrictionBanner restriction={restriction} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Fire Restrictions Active')).toBeInTheDocument()
  })

  it('displays the restriction message', () => {
    const restriction: FireRestrictionResult = {
      restrictionsActive: true,
      level: 'stage1',
      message: 'Active fire nearby',
    }
    render(<FireRestrictionBanner restriction={restriction} />)
    expect(screen.getByText('Active fire nearby')).toBeInTheDocument()
  })

  it('renders source link when provided', () => {
    const restriction: FireRestrictionResult = {
      restrictionsActive: true,
      level: 'stage1',
      message: 'Fire activity',
      sourceUrl: 'https://example.com/fire',
    }
    render(<FireRestrictionBanner restriction={restriction} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/fire')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('does not render link when sourceUrl is absent', () => {
    const restriction: FireRestrictionResult = {
      restrictionsActive: true,
      level: 'stage1',
      message: 'Fire activity',
    }
    render(<FireRestrictionBanner restriction={restriction} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
