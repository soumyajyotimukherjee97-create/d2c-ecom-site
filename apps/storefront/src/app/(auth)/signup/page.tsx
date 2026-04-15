import { Suspense } from 'react'
import SignupView from './SignupView'

export default function SignupPage() {
  return (
    <Suspense>
      <SignupView />
    </Suspense>
  )
}
