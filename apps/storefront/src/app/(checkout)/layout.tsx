// Bare layout for checkout + order confirmation — no shared Navbar, CartDrawer, or Footer.
// Each page in this group renders its own minimal navbar.

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
