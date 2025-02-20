"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "./ui/button"

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Bilsportlisens.com
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {session?.user.role === "ADMIN" && pathname !== "/admin" && (
            <Button variant="ghost" asChild>
              <Link href="/admin">
                Admin Dashboard
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logg ut
          </Button>
        </div>
      </div>
    </header>
  )
} 