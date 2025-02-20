"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Info } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface Order {
  id: string
  orderId: string
  status: string
  paymentStatus: string | null
  paymentMethod: string | null
  totalAmount: number
  driverName: string
  vehicleReg: string
  validFrom: string
  validTo?: string
  createdAt: string
  customerName: string | null
  customerEmail: string | null
  licenseName: string
  clubName: string
}

interface PaginationInfo {
  total: number
  pages: number
  currentPage: number
  perPage: number
  hasMore: boolean
}

const ORDER_STATUSES = [
  { value: "all", label: "Alle" },
  { value: "COMPLETED", label: "Fullført" },
  { value: "FAILED", label: "Feilet" }
]

const ORDER_STATUS_OPTIONS = [
  { value: "COMPLETED", label: "Fullført" },
  { value: "FAILED", label: "Feilet" },
  { value: "CANCELLED", label: "Kansellert" }
]

const getPaymentStatusBadge = (status: string | null) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge className="bg-green-500">Fullført</Badge>
    case 'CHARGED':
      return <Badge variant="destructive">Belastet</Badge>
    case 'PENDING':
      return <Badge variant="destructive">Venter</Badge>
    case null:
      return <Badge variant="secondary">Mangler status</Badge>
    default:
      return <Badge variant="destructive">{status}</Badge>
  }
}

// Først, la oss lage en funksjon for å telle antall ordrer per status
const getOrderCounts = (allOrders: Order[]) => ({
  all: allOrders.length,
  completed: allOrders.filter(order => order.paymentStatus === "COMPLETED").length,
  failed: allOrders.filter(order => order.paymentStatus !== "COMPLETED").length
})

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const limit = 20

  // Status-filter: "ALL", "COMPLETED" eller "FAILED"
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "COMPLETED" | "FAILED">("ALL")

  // ← Legg til for klient-side beregning av totalPages:
  const totalPages = Math.ceil(orders.length / limit)

  // ← Skjær ut ordrene for gjeldende side:
  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit

  // Filtrer ordrer lokalt basert på valgt status
  const filtered = orders.filter(order => {
    if (selectedStatus === "ALL") return true
    if (selectedStatus === "COMPLETED") return order.paymentStatus === "COMPLETED"
    return order.paymentStatus !== "COMPLETED" // "FAILED"
  })

  const totalPagesFiltered = Math.ceil(filtered.length / limit)
  const displayedOrders = filtered.slice(startIndex, endIndex)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const searchQuery = searchTerm ? `&search=${searchTerm}` : ""
        
        const response = await fetch(
          `/api/admin/orders?page=${currentPage}&limit=${limit}${searchQuery}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [currentPage, searchTerm])

  // Beregn antall ordrer per status
  const orderCounts = getOrderCounts(orders)

  const getPaymentMethodBadge = (method: string | null) => {
    switch (method?.toUpperCase()) {
      case 'VISA':
      case 'MASTERCARD':
        return <Badge variant="outline">💳 {method}</Badge>
      case 'VIPPS':
        return <Badge variant="outline">📱 Vipps</Badge>
      default:
        return method ? <Badge variant="outline">{method}</Badge> : null
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Oppdater ordrelisten
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ))
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  return (
    <div className="container space-y-6 p-4">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-2xl font-bold">Ordrer</h1>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søk ordre eller navn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          variant={selectedStatus === "ALL" ? "default" : "outline"}
          onClick={() => {
            setSelectedStatus("ALL")
            setCurrentPage(1) // hopp til side 1
          }}
        >
          Alle
        </Button>
        <Button
          variant={selectedStatus === "COMPLETED" ? "default" : "outline"}
          onClick={() => {
            setSelectedStatus("COMPLETED")
            setCurrentPage(1)
          }}
        >
          Fullført
        </Button>
        <Button
          variant={selectedStatus === "FAILED" ? "default" : "outline"}
          onClick={() => {
            setSelectedStatus("FAILED")
            setCurrentPage(1)
          }}
        >
          Feilet
        </Button>
      </div>

      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordre ID</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Lisens</TableHead>
              <TableHead>Klubb</TableHead>
              <TableHead>Beløp</TableHead>
              <TableHead>Ordre Status</TableHead>
              <TableHead>Betaling</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead className="w-[70px]">Handling</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.orderId}</TableCell>
                <TableCell>
                  <div>{order.customerName || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.customerEmail || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>{order.licenseName}</TableCell>
                <TableCell>{order.clubName}</TableCell>
                <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                <TableCell>
                  {getPaymentStatusBadge(order.status)}
                </TableCell>
                <TableCell>
                  {getPaymentMethodBadge(order.paymentMethod)}
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString('no-NO')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <OrderDetailsDialog order={order} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Åpne meny</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {ORDER_STATUS_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => updateOrderStatus(order.id, option.value)}
                            disabled={order.status === option.value}
                          >
                            Sett status til {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Bedre paginering med sidetall */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Forrige
          </Button>
          
          {/* Vis sidetall */}
          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1
            const isActive = page === currentPage
            return (
              <Button
                key={page}
                variant={isActive ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            )
          })}

          <Button
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Neste
          </Button>
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Ingen ordrer funnet</p>
        </div>
      )}
    </div>
  )
}

function OrderDetailsDialog({ 
  order,
}: { 
  order: Order
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="h-4 w-4" />
          <span className="sr-only">Vis detaljer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Ordre #{order.orderId}</span>
            {getPaymentStatusBadge(order.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-6 -mr-6">
          <div className="grid gap-6">
            {/* Kunde informasjon */}
            <div className="space-y-3">
              <h3 className="font-semibold border-b pb-2">Kundeinformasjon</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block">Navn</span>
                  <span className="font-medium">{order.customerName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">E-post</span>
                  <span className="font-medium">{order.customerEmail || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Lisens informasjon */}
            <div className="space-y-3">
              <h3 className="font-semibold border-b pb-2">Lisensdetaljer</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block">Lisenstype</span>
                  <span className="font-medium">{order.licenseName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Klubb</span>
                  <span className="font-medium">{order.clubName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Fører</span>
                  <span className="font-medium">{order.driverName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Kjøretøy</span>
                  <span className="font-medium">{order.vehicleReg || 'Ikke registrert'}</span>
                </div>
              </div>
            </div>

            {/* Betalingsinformasjon */}
            <div className="space-y-3">
              <h3 className="font-semibold border-b pb-2">Betalingsinformasjon</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block">Beløp</span>
                  <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Betalingsmåte</span>
                  <span className="font-medium">{order.paymentMethod || 'Ikke spesifisert'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Betalingsstatus</span>
                  <span className="font-medium">{order.paymentStatus || 'Ikke registrert'}</span>
                </div>
              </div>
            </div>

            {/* Datoer */}
            <div className="space-y-3">
              <h3 className="font-semibold border-b pb-2">Datoer</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block">Opprettet</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('no-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Gyldig fra</span>
                  <span className="font-medium">
                    {new Date(order.validFrom).toLocaleDateString('no-NO')}
                  </span>
                </div>
                {order.validTo && (
                  <div>
                    <span className="text-muted-foreground block">Gyldig til</span>
                    <span className="font-medium">
                      {new Date(order.validTo).toLocaleDateString('no-NO')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 