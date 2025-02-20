"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, Home, Calendar, ShoppingCart, LogOut } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { items } = useCart()
  const router = useRouter()

  // Dynamiske lenker basert på rolle:
  function getDashboardPath() {
    if (!session) return "/" // Ikke innlogget -> forside
    // Hvis Admin -> "/admin", ellers "/dashboard"
    return session.user.role === "ADMIN" ? "/admin" : "/dashboard"
  }

  const routes = [
    {
      href: "/",
      label: "Hjem",
      icon: Home,
      active: pathname === "/"
    },
    {
      href: "/activity",
      label: "Aktiviteter",
      icon: Calendar,
      active: pathname === "/activity"
    },
    {
      href: "/products",
      label: "Kjøp Lisens",
      icon: ShoppingCart,
      active: pathname === "/products"
    },
  ]

  const userRoutes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard"
    },
    {
      href: "/dashboard/licenses",
      label: "Mine Lisenser",
      active: pathname === "/dashboard/licenses"
    },
    {
      href: "/dashboard/orders",
      label: "Ordrehistorikk",
      active: pathname === "/dashboard/orders"
    },
    {
      href: "/dashboard/profile",
      label: "Profil",
      active: pathname === "/dashboard/profile"
    },
  ]

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo til venstre */}
        <div className="flex-none pl-10">
          <Link href={getDashboardPath()} className="flex items-center space-x-2">
            <Image src="/NBF_logo.png" alt="Logo" width={100} height={100} />
          </Link>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Navigasjonslenker i midten - TILPASS FOR ULIKE ROLLER */}
        {/* ---------------------------------------------------- */}
        <div className="flex-1 flex justify-center">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {/* Alltid ha en Dashboard-lenke for innloggede brukere */}
            {session && (
              <Link
                href={getDashboardPath()}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Dashboard
              </Link>
            )}

            {/* Hvis ikke innlogget eller admin */}
            {(!session || session.user.role === "ADMIN") ? (
              <>
                {/* Home / Kjøp lisens / Admin-lenker */}
                {!session && (
                  <Link
                    href="/"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Hjem
                  </Link>
                )}
                <Link
                  href="/products"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Kjøp Lisens
                </Link>
                {session?.user?.role === "ADMIN" && (
                  <>
                    <Link
                      href="/faq"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      FAQ
                    </Link>
                    <Link
                      href="/support"
                      className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Support
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Vanlig bruker (USER) */}
                <Link
                  href="/products"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Kjøp Lisens
                </Link>
                <Link
                  href="/dashboard/licenses"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Mine Lisenser
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Mine Ordrer
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Høyre side med handlekurv, theme toggle og bruker-meny */}
        <div className="flex items-center space-x-4">
          {/* Handlekurv */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/checkout">
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {items.length}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Bruker-meny */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {/* Admin-profil-lenke eller bruker-profil-lenke */}
                {session.user.role === "ADMIN" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile">Min profil</Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Min profil</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logg ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Logg inn</Link>
            </Button>
          )}
        </div>

        {/* Mobil-meny */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {routes.map((route) => (
              <DropdownMenuItem key={route.href} asChild>
                <Link href={route.href} className="flex items-center">
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </DropdownMenuItem>
            ))}
            {session && userRoutes.map((route) => (
              <DropdownMenuItem key={route.href} asChild>
                <Link href={route.href}>{route.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
} 