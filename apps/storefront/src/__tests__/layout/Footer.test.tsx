import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from '@/components/layout/Footer'

describe('Footer', () => {
  describe('structure', () => {
    it('renders a footer element', () => {
      render(<Footer />)
      expect(screen.getByTestId('footer').tagName).toBe('FOOTER')
    })

    it('renders the brand link', () => {
      render(<Footer />)
      expect(screen.getByTestId('footer-brand')).toHaveTextContent('Form.')
    })

    it('brand link points to /', () => {
      render(<Footer />)
      expect(screen.getByTestId('footer-brand')).toHaveAttribute('href', '/')
    })

    it('renders copyright text', () => {
      render(<Footer />)
      expect(screen.getByTestId('footer-copyright').textContent).toMatch(/Form\. All rights reserved/)
    })

    it('renders privacy link', () => {
      render(<Footer />)
      const link = screen.getByTestId('footer-privacy')
      expect(link).toHaveTextContent('Privacy')
      expect(link).toHaveAttribute('href', '/privacy')
    })

    it('renders terms link', () => {
      render(<Footer />)
      const link = screen.getByTestId('footer-terms')
      expect(link).toHaveTextContent('Terms')
      expect(link).toHaveAttribute('href', '/terms')
    })
  })

  describe('link groups', () => {
    it('renders Shop heading', () => {
      render(<Footer />)
      expect(screen.getByTestId('footer-heading-shop')).toBeInTheDocument()
    })

    it('renders Learn heading', () => {
      render(<Footer />)
      expect(screen.getByTestId('footer-heading-learn')).toBeInTheDocument()
    })

    it('renders Help heading', () => {
      render(<Footer />)
      expect(screen.getByTestId('footer-heading-help')).toBeInTheDocument()
    })

    it('renders All products link under Shop', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: 'All products' })).toHaveAttribute(
        'href',
        '/products',
      )
    })

    it('renders Serums link pointing to filtered PLP', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: 'Serums' })).toHaveAttribute(
        'href',
        '/products?category=serum',
      )
    })

    it('renders Journal link under Learn', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: 'Journal' })).toHaveAttribute('href', '/journal')
    })

    it('renders Contact link pointing to /support/new', () => {
      render(<Footer />)
      expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute(
        'href',
        '/support/new',
      )
    })
  })

  describe('accessibility', () => {
    it('all links are anchor elements', () => {
      render(<Footer />)
      const links = screen.getAllByRole('link')
      links.forEach((link) => expect(link.tagName).toBe('A'))
    })
  })
})
