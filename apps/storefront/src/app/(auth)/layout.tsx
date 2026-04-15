// Bare layout for the auth flow (login / signup).
// No shared Navbar, CartDrawer, or Footer — each page renders its own minimal header.

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
