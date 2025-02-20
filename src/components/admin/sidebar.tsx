"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  IdCard, 
  ShoppingCart, 
  Users,
  Building2,
} from "lucide-react"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "Lisenser",
    href: "/admin/licenses",
    icon: IdCard
  },
  {
    title: "Klubber",
    href: "/admin/clubs",
    icon: Building2
  },
  {
    title: "Ordrer",
    href: "/admin/orders",
    icon: ShoppingCart
  },
  {
    title: "Brukere",
    href: "/admin/users",
    icon: Users
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1 w-64 p-4 border-r h-screen">
      {adminNavItems.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
} 