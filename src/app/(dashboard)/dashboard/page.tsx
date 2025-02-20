"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { CalendarIcon, CarIcon, UserIcon, ClockIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Shell } from "@/components/shell"

interface Order {
  orderId: string
  licenseName: string
  status: string
  totalAmount: number
  validFrom: string
  validTo?: string
  clubName: string
  driverName: string
  vehicleReg: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(Array.isArray(data.orders) ? data.orders : [])
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

  const now = new Date()

  // Oppdatert filtrering - kun basert på datoer
  const activeLicenses = orders.filter(order => 
    order.status === "COMPLETED" && 
    new Date(order.validFrom) > now  // Fremtidige lisenser er aktive
  )

  const expiredLicenses = orders.filter(order => 
    order.status === "COMPLETED" && 
    new Date(order.validFrom) <= now  // Alle datoer som har vært er utgått
  )

  // Finn neste race fra aktive lisenser (sorter på validFrom)
  const nextRace = activeLicenses.length > 0 
    ? [...activeLicenses].sort((a, b) => 
        new Date(a.validFrom).getTime() - new Date(b.validFrom).getTime()
      )[0] 
    : null

  if (isLoading) return <div className="p-4">Laster...</div>

  return (
    <Shell>
      <div className="container space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Statistikk-kort */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktive Lisenser</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLicenses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Utgåtte Lisenser</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiredLicenses.length}</div>
            </CardContent>
          </Card>

          {nextRace && (
            <Card className="sm:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Neste Race</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{nextRace.licenseName}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(nextRace.validFrom).toLocaleDateString('no-NO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lisensoversikt */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Aktive ({activeLicenses.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Utgåtte ({expiredLicenses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeLicenses.map((license) => (
                <Card key={license.orderId} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base font-semibold">{license.licenseName}</span>
                      <div className="flex gap-2 items-center">
                        <Badge 
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Aktiv
                        </Badge>
                        <Badge variant="outline">{license.clubName}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <UserIcon className="h-4 w-4 mr-2" />
                        {license.driverName}
                      </div>
                      <div className="flex items-center text-sm">
                        <CarIcon className="h-4 w-4 mr-2" />
                        {license.vehicleReg || 'Ikke registrert'}
                      </div>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {new Date(license.validFrom).toLocaleDateString('no-NO')}
                      </div>
                      <div className="pt-2 text-sm font-medium">
                        {formatPrice(license.totalAmount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expiredLicenses.map((license) => (
                <Card key={license.orderId} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base font-semibold">{license.licenseName}</span>
                      <div className="flex gap-2 items-center">
                        <Badge 
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Utgått
                        </Badge>
                        <Badge variant="outline">{license.clubName}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <UserIcon className="h-4 w-4 mr-2" />
                        {license.driverName}
                      </div>
                      <div className="flex items-center text-sm">
                        <CarIcon className="h-4 w-4 mr-2" />
                        {license.vehicleReg || 'Ikke registrert'}
                      </div>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {new Date(license.validFrom).toLocaleDateString('no-NO')}
                      </div>
                      <div className="pt-2 text-sm font-medium">
                        {formatPrice(license.totalAmount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  )
} 