import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { ClubForm } from "@/components/admin/club-form"
import { ClubTable } from "@/components/admin/club-table"

export default async function AdminClubsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Klubbadministrasjon"
        text="Administrer klubber"
      />
      <div className="grid gap-8">
        <ClubForm />
        <ClubTable />
      </div>
    </DashboardShell>
  )
} 