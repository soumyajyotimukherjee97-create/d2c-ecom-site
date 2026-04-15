import { Suspense } from 'react'
import LoginView from './LoginView'

// useSearchParams inside LoginView opts this route out of static prerendering.
// Wrapping in Suspense satisfies Next's CSR-bailout requirement cleanly.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  )
}
