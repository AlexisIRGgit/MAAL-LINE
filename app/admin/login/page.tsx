import { Suspense } from 'react'
import AdminLoginForm from './admin-login-form'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#111827] border-t-transparent rounded-full" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}
