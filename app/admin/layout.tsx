import { AdminSidebar } from '@/components/admin/sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050505] flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-3 lg:p-4">
          {children}
        </div>
      </main>
    </div>
  )
}
