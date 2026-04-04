import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TripPlanCard } from '../TripPlanCard'
import type { TripPlanResult } from '../../../services/api'

function makePlan(overrides: Partial<TripPlanResult> = {}): TripPlanResult {
  return {
    readiness: {
      goodIf: ['Dry weather', 'Before 3pm arrival'],
      badIf: ['Heavy rain', 'Late arrival'],
    },
    stopPlan: '• Total drive: 2 hours\n• Last fuel: Town, 10 miles',
    waterFuelMath: '• Min water: 2 gal per person',
    rigAccess: '• Best for: Sprinter vans\n• Clearance risk: low',
    arrivalStrategy: '• Arrive before: 3 PM',
    campConditions: '• Quiet: 8/10',
    resupplyWaste: '• Water: 10 miles',
    connectivity: '• Verizon: good coverage',
    rulesRisks: '• Max stay: 14 days',
    backupPlan: '• Backup 1: Other Camp, 5 miles',
    ...overrides,
  }
}

describe('TripPlanCard', () => {
  it('renders trip readiness section with good/bad conditions', () => {
    render(<TripPlanCard plan={makePlan()} />)
    expect(screen.getByText('Trip Readiness')).toBeInTheDocument()
    expect(screen.getByText('Dry weather')).toBeInTheDocument()
    expect(screen.getByText('Heavy rain')).toBeInTheDocument()
  })

  it('renders section titles', () => {
    render(<TripPlanCard plan={makePlan()} />)
    expect(screen.getByText('Route + Stop Plan')).toBeInTheDocument()
    expect(screen.getByText('Water + Fuel Math')).toBeInTheDocument()
    expect(screen.getByText('Rig Access Check')).toBeInTheDocument()
  })

  it('shows initially expanded sections content', () => {
    render(<TripPlanCard plan={makePlan()} />)
    // stopPlan is expanded by default — parseBullets splits "label: value" so search for the label part
    expect(screen.getByText(/Total drive:/)).toBeInTheDocument()
    expect(screen.getByText(/Best for:/)).toBeInTheDocument()
  })

  it('expands a collapsed section on click', () => {
    render(<TripPlanCard plan={makePlan()} />)
    // campConditions is collapsed by default
    expect(screen.queryByText(/Quiet:/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Camp Conditions'))
    expect(screen.getByText(/Quiet:/)).toBeInTheDocument()
  })

  it('collapses an expanded section on click', () => {
    render(<TripPlanCard plan={makePlan()} />)
    // stopPlan is expanded by default
    expect(screen.getByText(/Total drive:/)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Route + Stop Plan'))
    expect(screen.queryByText(/Total drive:/)).not.toBeInTheDocument()
  })
})
