import { Suspense } from 'react'
import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#E8E4D9] text-xs">Cargando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
