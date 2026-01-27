"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { CalendarIcon, CarIcon, UserIcon, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  orderId: string
  licenseName: string
  status: string
  totalAmount: number
  validFrom: string
  validTo?: string
  clubName: string
  driverName: string
  vehicleReg: string
  paymentStatus: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDownloadPDF = async (order: Order) => {
    try {
      setDownloadingId(order.id)
      
      // Hent PDF fra API
      const response = await fetch(`/api/payment/receipt/${order.id}`)
      
      if (!response.ok) {
        throw new Error('Kunne ikke laste ned PDF')
      }

      // Last ned PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lisens_${order.driverName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${order.orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "PDF lastet ned",
        description: "Lisenskvitteringen er lastet ned",
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: "Kunne ikke laste ned PDF",
        description: "Prøv igjen senere",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          console.log('Raw API response:', data) // Debug logging
          
          if (!data.orders) {
            setOrders([])
            return
          }

          // Filtrer på betalingsstatus og order status
          const completedOrders = data.orders.filter((order: Order) => 
            order.status === "COMPLETED"  // Fjernet paymentStatus sjekk midlertidig
          )
          
          console.log('Completed orders:', completedOrders) // Debug logging

          const now = new Date()
          
          const futureOrders = completedOrders.filter((order: Order) => 
            new Date(order.validFrom) > now
          )
          
          const pastOrders = completedOrders.filter((order: Order) => 
            new Date(order.validFrom) <= now
          )
          
          const sortedFutureOrders = futureOrders.sort((a: Order, b: Order) => 
            new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
          )
          
          const sortedPastOrders = pastOrders.sort((a: Order, b: Order) => 
            new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
          )
          
          setOrders([...sortedFutureOrders, ...sortedPastOrders])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const isUpcoming = (date: string) => new Date(date) > new Date()

  if (isLoading) return <div>Laster...</div>

  return (
    <div className="container space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Ordrehistorikk</h1>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.orderId} className="overflow-hidden">
            {/* Mobilvennlig kort-design */}
            <div className="sm:hidden">
              <CardHeader className="p-4">
                <CardTitle className="flex flex-col space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-base">{order.licenseName}</span>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge 
                        className={isUpcoming(order.validFrom) 
                          ? "bg-green-500 hover:bg-green-600" 
                          : "bg-red-500 hover:bg-red-600"}
                      >
                        {isUpcoming(order.validFrom) ? "Aktiv" : "Utløpt"}
                      </Badge>
                      <Badge variant={order.status === 'COMPLETED' ? 'outline' : 'destructive'}>
                        {order.status === 'COMPLETED' ? 'Fullført' : 'Avbrutt'}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">#{order.orderId}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{order.driverName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{order.vehicleReg || 'Ikke registrert'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(order.validFrom).toLocaleDateString('no-NO')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">{order.clubName}</span>
                  <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                </div>
                {order.status === 'COMPLETED' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => handleDownloadPDF(order)}
                    disabled={downloadingId === order.id}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloadingId === order.id ? 'Laster ned...' : 'Last ned kvittering'}
                  </Button>
                )}
              </CardContent>
            </div>

            {/* Desktop-visning */}
            <div className="hidden sm:block">
              <CardContent className="p-6">
                <div className="grid grid-cols-8 gap-4 items-center">
                  <div className="col-span-2">
                    <div className="font-semibold">{order.licenseName}</div>
                    <div className="text-sm text-muted-foreground">#{order.orderId}</div>
                  </div>
                  <div className="text-sm">
                    {new Date(order.validFrom).toLocaleDateString('no-NO')}
                  </div>
                  <div className="text-sm">{order.clubName}</div>
                  <div className="text-right font-medium">
                    {formatPrice(order.totalAmount)}
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={isUpcoming(order.validFrom) 
                        ? "bg-green-500 hover:bg-green-600" 
                        : "bg-red-500 hover:bg-red-600"}
                    >
                      {isUpcoming(order.validFrom) ? "Aktiv" : "Utløpt"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <Badge variant={order.status === 'COMPLETED' ? 'outline' : 'destructive'}>
                      {order.status === 'COMPLETED' ? 'Fullført' : 'Avbrutt'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    {order.status === 'COMPLETED' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadPDF(order)}
                        disabled={downloadingId === order.id}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadingId === order.id ? 'Laster...' : 'PDF'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Ingen ordrer funnet</p>
          </div>
        )}
      </div>
    </div>
  )
} 