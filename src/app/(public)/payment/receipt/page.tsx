"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { Shell } from "@/components/shell"

interface OrderDetails {
  orderId: string
  driverName: string
  licenseName: string
  totalAmount: number
  validFrom: string
  validTo?: string
  clubName: string
  clubShortName?: string
  items: {
    id: string
    name: string
    price: number
    validFrom: string
    validTo?: string
    vehicleReg?: string
    driverName: string
  }[]
}

function ReceiptContent() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  
  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = searchParams.get("orderId")
      if (!orderId) return
      
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      }
    }
    
    fetchOrder()
  }, [searchParams])

  if (!order) return null

  return (
    <Shell>
      <div className="container max-w-lg py-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Kvittering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Ordre #{order.orderId}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Lisensdetaljer</h3>
              <p>{order.licenseName}</p>
              <p>Gyldig fra: {new Date(order.validFrom).toLocaleDateString('no-NO')}</p>
              {order.validTo && (
                <p>Gyldig til: {new Date(order.validTo).toLocaleDateString('no-NO')}</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Klubb</h3>
              <p>{order.clubName}</p>
              {order.clubShortName && <p className="text-sm text-muted-foreground">({order.clubShortName})</p>}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Fører</h3>
              <p>{order.driverName}</p>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="border-t pt-4">
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Fører: {item.driverName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reg.nr: {item.vehicleReg || 'Ikke registrert'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Gyldig: {new Date(item.validFrom).toLocaleDateString('no-NO')}
                        {item.validTo && ` - ${new Date(item.validTo).toLocaleDateString('no-NO')}`}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <ReceiptContent />
    </Suspense>
  )
} 