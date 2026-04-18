import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/browser'

// usePathname is mocked in setup.ts → returns '/'

describe('Navbar', () => {
  describe('structure', () => {
    it('renders the header element', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar').tagName).toBe('HEADER')
    })

    it('renders the brand wordmark', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-brand')).toHaveTextContent('matter.')
    })

    it('brand link points to /', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-brand')).toHaveAttribute('href', '/')
    })

    it('renders all four desktop nav links', () => {
      render(<Navbar />)
      expect(screen.getByTestId('nav-link-shop')).toBeInTheDocument()
      expect(screen.getByTestId('nav-link-ingredients')).toBeInTheDocument()
      expect(screen.getByTestId('nav-link-skininsight')).toBeInTheDocument()
      expect(screen.getByTestId('nav-link-about')).toBeInTheDocument()
    })

    it('SkinInsight link points to /skin-insight (coming-soon)', () => {
      render(<Navbar />)
      expect(screen.getByTestId('nav-link-skininsight')).toHaveAttribute('href', '/skin-insight')
    })

    it('Ingredients link points to /ingredients', () => {
      render(<Navbar />)
      expect(screen.getByTestId('nav-link-ingredients')).toHaveAttribute('href', '/ingredients')
    })

    it('renders account and cart (no search button in V2)', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-account')).toBeInTheDocument()
      expect(screen.getByTestId('navbar-cart')).toBeInTheDocument()
      expect(screen.queryByTestId('navbar-search')).not.toBeInTheDocument()
    })

    it('account link points to /login when signed out', () => {
      render(<Navbar />)
      // Default supabase mock returns { user: null } — treated as signed-out
      expect(screen.getByTestId('navbar-account')).toHaveAttribute('href', '/login')
    })

    it('signed-out account link renders "Account" text label', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-account')).toHaveTextContent(/account/i)
    })
  })

  describe('active link', () => {
    it('no nav link has aria-current="page" when pathname is / (no exact match)', () => {
      render(<Navbar />)
      // pathname mock returns '/' — none of the nav links map to '/'
      const links = [
        screen.getByTestId('nav-link-shop'),
        screen.getByTestId('nav-link-ingredients'),
        screen.getByTestId('nav-link-skininsight'),
        screen.getByTestId('nav-link-about'),
      ]
      links.forEach((link) => expect(link).not.toHaveAttribute('aria-current'))
    })
  })

  describe('cart bag', () => {
    it('shows (0) when cart count is 0', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-cart-count')).toHaveTextContent('(0)')
    })

    it('cart button has accessible label "Bag" when count is 0', () => {
      render(<Navbar />)
      expect(screen.getByTestId('navbar-cart')).toHaveAttribute('aria-label', 'Bag')
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
      expect(screen.getByTestId('mobile-nav-link-skininsight')).toBeInTheDocument()
      expect(screen.getByTestId('mobile-nav-link-about')).toBeInTheDocument()
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

  describe('auth state', () => {
    it('shows initials square and links to /account when signed in', async () => {
      vi.mocked(createClient).mockReturnValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { email: 'priya.mehta@example.com', user_metadata: {} } },
            error: null,
          }),
          onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        },
        from: vi.fn(),
      } as never)

      render(<Navbar />)

      await waitFor(() => {
        expect(screen.getByTestId('navbar-account')).toHaveAttribute('href', '/account')
      })
      expect(screen.getByTestId('navbar-account-initials')).toHaveTextContent('PM')
    })
  })

  describe('sticky behaviour', () => {
    it('uses sticky positioning (matter: always on paper background, never transparent)', () => {
      render(<Navbar />)
      const el = screen.getByTestId('navbar')
      expect(el.className).toContain('sticky')
      expect(el.className).toContain('bg-paper')
    })
  })
})
