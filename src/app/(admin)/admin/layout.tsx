
import { AdminSidebar } from "@/components/admin/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
} 