"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Lisenser",
    href: "/dashboard/licenses",
  },
  {
    title: "Ordrer",
    href: "/dashboard/orders",
  },
  {
    title: "Profil",
    href: "/dashboard/profile",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1 w-64 p-4 border-r h-screen">
      {sidebarNavItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            {item.title}
          </Button>
        </Link>
      ))}
    </nav>
  )
} 