"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          Admin Dashboard
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/admin"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/admin" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Oversikt
        </Link>
        <Link
          href="/"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          Tilbake til nettside
        </Link>
      </nav>
    </div>
  )
} 