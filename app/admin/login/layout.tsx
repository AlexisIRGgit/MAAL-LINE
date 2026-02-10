// Override admin layout - no sidebar for login page
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {children}
    </div>
  )
}
