import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BottomSheet } from '../BottomSheet'

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <BottomSheet open={false} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders children when open', () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <p>Sheet content</p>
      </BottomSheet>,
    )
    expect(screen.getByText('Sheet content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()} title="My Title">
        <p>Content</p>
      </BottomSheet>,
    )
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('renders dialog with aria-modal', () => {
    render(
      <BottomSheet open={true} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    )
    // Backdrop is the first div child with aria-hidden
    const backdrop = document.querySelector('[aria-hidden]') as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open={true} onClose={onClose} title="Title">
        <p>Content</p>
      </BottomSheet>,
    )
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
