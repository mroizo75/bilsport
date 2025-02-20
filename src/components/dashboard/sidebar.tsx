import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  User, 
  CreditCard, 
  FileText,
  ShoppingBag
} from "lucide-react"

const routes = [
  {
    label: 'Oversikt',
    icon: FileText,
    href: '/dashboard',
  },
  {
    label: 'Lisenser',
    icon: CreditCard,
    href: '/dashboard/licenses',
  },
  {
    label: 'Ordrer',
    icon: ShoppingBag,
    href: '/dashboard/orders',
  },
  {
    label: 'Profil',
    icon: User,
    href: '/dashboard/profile',
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-secondary/10">
      <div className="px-3 py-2 flex-1">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 