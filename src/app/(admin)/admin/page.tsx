"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

interface Order {
  id: string
  orderId: string
  driverName: string
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
  licenseName: string
  clubName: string
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Nytt for paginering:
  const [completedPage, setCompletedPage] = useState(1)
  const [pendingPage, setPendingPage] = useState(1)
  const [failedPage, setFailedPage] = useState(1)
  const limit = 20

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        } else {
          console.error('Failed to fetch orders:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Filtrer ordrer basert på status
  const completedOrders = orders.filter(order => order.status === "COMPLETED")
  const pendingOrders = orders.filter(order => order.status === "PENDING")
  const failedOrders = orders.filter(order => order.status === "FAILED")

  // Beregn statistikk kun fra fullførte ordrer
  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
  const averageOrderValue = completedOrders.length > 0 
    ? totalRevenue / completedOrders.length 
    : 0

  // Hjelpefunksjon for å dele opp listen for en spesifikk side
  function paginateArr(arr: Order[], currentPage: number, limit: number) {
    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit
    return arr.slice(startIndex, endIndex)
  }

  // Fullført
  const totalCompletedPages = Math.ceil(completedOrders.length / limit)
  const displayedCompleted = paginateArr(completedOrders, completedPage, limit)

  // Ventende
  const totalPendingPages = Math.ceil(pendingOrders.length / limit)
  const displayedPending = paginateArr(pendingOrders, pendingPage, limit)

  // Feilet
  const totalFailedPages = Math.ceil(failedOrders.length / limit)
  const displayedFailed = paginateArr(failedOrders, failedPage, limit)

  const OrdersTable = ({ orders }: { orders: Order[] }) => (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-muted/50">
          <tr className="text-xs font-medium text-foreground/80 uppercase tracking-wider">
            <th className="px-3 py-2 text-left">Ordre ID</th>
            <th className="px-3 py-2 text-left">Fører</th>
            <th className="px-3 py-2 text-left">Lisens</th>
            <th className="px-3 py-2 text-left">Klubb</th>
            <th className="px-3 py-2 text-left">Beløp</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Dato</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b last:border-none hover:bg-muted/20 transition-colors">
              <td className="px-3 py-2">{order.orderId}</td>
              <td className="px-3 py-2">{order.driverName}</td>
              <td className="px-3 py-2">{order.licenseName}</td>
              <td className="px-3 py-2">{order.clubName}</td>
              <td className="px-3 py-2">{formatPrice(order.totalAmount)}</td>
              <td className="px-3 py-2">{order.paymentStatus}</td>
              <td className="px-3 py-2">{new Date(order.createdAt).toLocaleDateString('no-NO')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (isLoading) {
    return <div>Laster...</div>
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Administrasjon</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Omsetning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Fra {completedOrders.length} fullførte ordre(r)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gjennomsnittlig Ordre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per fullført ordre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventende Ordrer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Ikke fullførte betalinger
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feilede Ordrer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Betalinger som feilet
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="completed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="completed">
            Fullført ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Ventende ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Feilet ({failedOrders.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="completed" className="space-y-4">
          <OrdersTable orders={displayedCompleted} />

          {/* Paginering for fullførte */}
          {totalCompletedPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCompletedPage(p => Math.max(1, p - 1))}
                disabled={completedPage === 1}
              >
                Forrige
              </button>
              <span>
                Side {completedPage} av {totalCompletedPages}
              </span>
              <button
                onClick={() => setCompletedPage(p => Math.min(totalCompletedPages, p + 1))}
                disabled={completedPage === totalCompletedPages}
              >
                Neste
              </button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <OrdersTable orders={displayedPending} />

          {/* Paginering for ventende */}
          {totalPendingPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                disabled={pendingPage === 1}
              >
                Forrige
              </button>
              <span>
                Side {pendingPage} av {totalPendingPages}
              </span>
              <button
                onClick={() => setPendingPage(p => Math.min(totalPendingPages, p + 1))}
                disabled={pendingPage === totalPendingPages}
              >
                Neste
              </button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="failed" className="space-y-4">
          <OrdersTable orders={displayedFailed} />

          {/* Paginering for feilet */}
          {totalFailedPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFailedPage(p => Math.max(1, p - 1))}
                disabled={failedPage === 1}
              >
                Forrige
              </button>
              <span>
                Side {failedPage} av {totalFailedPages}
              </span>
              <button
                onClick={() => setFailedPage(p => Math.min(totalFailedPages, p + 1))}
                disabled={failedPage === totalFailedPages}
              >
                Neste
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 