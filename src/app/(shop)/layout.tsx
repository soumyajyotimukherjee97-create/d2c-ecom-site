import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/*
        pt-16 (64px) offsets the fixed navbar height (py-4 top+bottom = 32px,
        icon height 32px → total ~64px). Keeps page content clear of the nav bar.
      */}
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer />
    </>
  )
}
