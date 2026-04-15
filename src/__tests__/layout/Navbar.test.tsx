import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'

// usePathname is mocked in setup.ts → returns '/'

describe('Navbar', () => {
  describe('structure', () => {
    it('renders the header element', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar').tagName).toBe('HEADER')
    })

    it('renders the brand link', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-brand')).toHaveTextContent('Form.')
    })

    it('brand link points to /', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-brand')).toHaveAttribute('href', '/')
    })

    it('renders all four desktop nav links', () => {
      render(<Navbar />)
      expect(screen.getByTestId('nav-link-shop')).toBeInTheDocument()
      expect(screen.getByTestId('nav-link-ingredients')).toBeInTheDocument()
      expect(screen.getByTestId('nav-link-about')).toBeInTheDocument()
      expect(screen.getByTestId('nav-link-journal')).toBeInTheDocument()
    })

    it('renders search, account, and cart icon buttons', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-search')).toBeInTheDocument()
      expect(screen.getByTestId('navbar-account')).toBeInTheDocument()
      expect(screen.getByTestId('navbar-cart')).toBeInTheDocument()
    })

    it('account link points to /account', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-account')).toHaveAttribute('href', '/account')
    })
  })

  describe('active link', () => {
    it('no nav link has aria-current="page" when pathname is / (no exact match)', () => {
      render(<Navbar />)
      // pathname mock returns '/' — none of the nav links map to '/'
      const links = [
        screen.getByTestId('nav-link-shop'),
        screen.getByTestId('nav-link-ingredients'),
        screen.getByTestId('nav-link-about'),
        screen.getByTestId('nav-link-journal'),
      ]
      links.forEach((link) => expect(link).not.toHaveAttribute('aria-current'))
    })
  })

  describe('cart badge', () => {
    it('cart badge is not shown when cart count is 0', () => {
      render(<Navbar />)
      expect(screen.queryByTestId('navbar-cart-badge')).not.toBeInTheDocument()
    })

    it('cart button has accessible label "Cart" when count is 0', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-cart')).toHaveAttribute('aria-label', 'Cart')
    })
  })

  describe('mobile menu', () => {
    it('renders the mobile toggle button', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-mobile-toggle')).toBeInTheDocument()
    })

    it('mobile menu is not visible initially', () => {
      render(<Navbar />)
      expect(screen.queryByTestId('navbar-mobile-menu')).not.toBeInTheDocument()
    })

    it('mobile menu opens when toggle is clicked', async () => {
      render(<Navbar />)
      await userEvent.click(screen.getByTestId('navbar-mobile-toggle'))
      expect(screen.getByTestId('navbar-mobile-menu')).toBeInTheDocument()
    })

    it('mobile menu contains all nav links', async () => {
      render(<Navbar />)
      await userEvent.click(screen.getByTestId('navbar-mobile-toggle'))
      expect(screen.getByTestId('mobile-nav-link-shop')).toBeInTheDocument()
      expect(screen.getByTestId('mobile-nav-link-ingredients')).toBeInTheDocument()
      expect(screen.getByTestId('mobile-nav-link-about')).toBeInTheDocument()
      expect(screen.getByTestId('mobile-nav-link-journal')).toBeInTheDocument()
    })

    it('toggle button aria-expanded reflects open state', async () => {
      render(<Navbar />)
      const toggle = screen.getByTestId('navbar-mobile-toggle')
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await userEvent.click(toggle)
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })

    it('mobile menu closes when toggle is clicked again', async () => {
      render(<Navbar />)
      const toggle = screen.getByTestId('navbar-mobile-toggle')
      await userEvent.click(toggle)
      await userEvent.click(toggle)
      expect(screen.queryByTestId('navbar-mobile-menu')).not.toBeInTheDocument()
    })

    it('mobile menu closes when a mobile link is clicked', async () => {
      render(<Navbar />)
      await userEvent.click(screen.getByTestId('navbar-mobile-toggle'))
      await userEvent.click(screen.getByTestId('mobile-nav-link-shop'))
      expect(screen.queryByTestId('navbar-mobile-menu')).not.toBeInTheDocument()
    })
  })

  describe('scroll behaviour', () => {
    it('starts in transparent state (not scrolled)', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar').className).toContain('bg-transparent')
    })

    it('transitions to white background after scroll', () => {
      render(<Navbar />)
      fireEvent.scroll(window, { target: { scrollY: 100 } })
      expect(screen.getByTestId('navbar').className).toContain('bg-white')
    })
  })
})
