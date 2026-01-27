"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Loader2, CheckCircle, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  orderId: string
  status: string
  totalAmount: number
  driverName: string
  validFrom: string
  customerEmail: string
  customerPhone: string
  club: {
    name: string
  }
  license: {
    name: string
    category: string
    description: string
  }
  vehicleReg: string
}

function CompletePageContent() {
  const { clearCart } = useCart()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("paymentId") || searchParams.get("pid")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId || isVerified) return

      // Sjekk om denne betalingen allerede er verifisert i session
      const verifiedKey = `payment_verified_${paymentId}`
      if (typeof window !== 'undefined') {
        const alreadyVerified = sessionStorage.getItem(verifiedKey)
        if (alreadyVerified) {
          console.log('[PAYMENT] Already verified, loading orders from session')
          try {
            const savedOrders = JSON.parse(alreadyVerified)
            setOrders(savedOrders)
            setIsVerified(true)
            setIsLoading(false)
            return
          } catch (e) {
            console.error('[PAYMENT] Failed to parse saved orders')
          }
        }
      }

      try {
        setIsVerified(true)
        const response = await fetch(`/api/payment?paymentId=${paymentId}`)
        if (!response.ok) {
          throw new Error(`Betalingsverifisering feilet: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        if (!data.orderIds || data.orderIds.length === 0) {
          throw new Error("Ingen ordre-ID returnert fra betalingsverifisering")
        }

        // Hent alle ordredetaljer
        const orderDetails = await Promise.all(
          data.orderIds.map(async (orderId: string) => {
            const orderResponse = await fetch(`/api/orders/${orderId}`)
            if (!orderResponse.ok) {
              throw new Error(`Kunne ikke hente ordredetaljer: ${orderResponse.statusText}`)
            }
            return orderResponse.json()
          })
        )

        // Sett ordredetaljene først
        setOrders(orderDetails)
        
        // Lagre i session storage for å unngå re-verifisering
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(verifiedKey, JSON.stringify(orderDetails))
        }
        
        // TØM HANDLEKURVEN - både zustand og localStorage
        console.log('[CART] Clearing cart after successful payment')
        clearCart()
        localStorage.removeItem('savedCart') // For guest users
        
        toast({
          title: "Betaling fullført",
          description: "Din bestilling er bekreftet",
        })

      } catch (error) {
        console.error("Feil ved verifisering:", error)
        toast({
          title: "Betalingsverifisering feilet",
          description: error instanceof Error ? error.message : "Ukjent feil",
          variant: "destructive",
        })
        router.push("/checkout")
      } finally {
        setIsLoading(false)
      }
    }

    verifyPayment()
  }, [paymentId, isVerified, router, toast, clearCart])

  const handleDownloadReceipt = async (orderIndex?: number) => {
    if (orders.length === 0) return

    try {
      // Generer PDF for spesifikk ordre eller alle
      const ordersToProcess = orderIndex !== undefined ? [orderIndex] : orders.map((_, i) => i)

      for (const i of ordersToProcess) {
        const order = orders[i]
        
        // Hent PDF fra API (samme som sendes på email)
        const response = await fetch(`/api/payment/receipt/${order.id}`)
        
        if (!response.ok) {
          throw new Error(`Kunne ikke generere PDF for ordre ${order.orderId}`)
        }

        // Last ned PDF
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lisens_${i + 1}_${order.driverName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Liten pause mellom nedlastinger
        if (ordersToProcess.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      toast({
        title: "PDF lastet ned",
        description: `${ordersToProcess.length} lisens${ordersToProcess.length > 1 ? 'er' : ''} lastet ned som separate PDF-filer`,
      })
    } catch (error) {
      console.error('Feil ved generering av PDF:', error)
      toast({
        title: "Kunne ikke laste ned kvittering",
        description: "Prøv igjen senere eller kontakt support",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Verifiserer betaling...</span>
          <span className="text-sm text-muted-foreground">PaymentID: {paymentId}</span>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="w-full max-w-3xl">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-red-600">Kunne ikke finne ordrer</p>
              <Button asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbake til dashbord
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/50 py-10">
      <div className="container max-w-3xl">
        {orders.map((order, index) => (
          <Card key={order.id} className="mb-8">
            <div className="p-6">
              <CardHeader className="text-center space-y-6 pb-8">
                <svg 
                  viewBox="0 0 24 24" 
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold">Betaling Gjennomført</CardTitle>
                  {orders.length > 1 && (
                    <p className="text-lg font-semibold text-primary">
                      Lisens {index + 1} av {orders.length}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    Ordrenummer: {order.orderId}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Lisens Informasjon */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Lisensdetaljer</h3>
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hovedkategori:</span>
                      <span className="font-medium">{order.license.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lisenstype:</span>
                      <span className="font-medium">{order.license.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Klubb:</span>
                      <span className="font-medium">{order.club.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fører:</span>
                      <span className="font-medium">{order.driverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reg.nr:</span>
                      <span className="font-medium">{order.vehicleReg || 'Ikke registrert'}</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span className="font-medium">Race Dato:</span>
                      <span className="font-bold">
                        {new Date(order.validFrom).toLocaleDateString('no-NO')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kontaktinformasjon */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Kontaktinformasjon</h3>
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">E-post:</span>
                      <span className="font-medium">{order.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefon:</span>
                      <span className="font-medium">{order.customerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Betalingsinformasjon */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Betalingsinformasjon</h3>
                  <div className="grid gap-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Beløp for denne lisensen:</span>
                      <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Viktig informasjon */}
                <div className="space-y-4 bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border-2 border-amber-200 dark:border-amber-800">
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                    ⚠️ VIKTIG INFORMASJON
                  </h3>
                  <div className="space-y-3 text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-bold text-base">
                      ENGANGSLISENSER FOR BANEDAG ETTER GODKJENNING AV NORGES BILSPORTFORBUND (NBF)
                    </p>
                    <ul className="space-y-2 list-disc list-inside pl-2">
                      <li>Banedagen må være arrangert i henhold til NBFs reglement og av klubb/avdeling tilsluttet NBF.</li>
                      <li>For denne lisensen kreves IKKE medlemskap i klubb/avdeling tilsluttet NBF.</li>
                      <li>Fører er gjennom denne lisensen forsikret på samme måte som ved vanlig helårslisens, men kun for gjeldende banedag.</li>
                      <li>For å få utstedt engangslisens kan ikke førerretten for førerkortfri motorvogn være midlertidig tilbakekalt eller fratatt føreren (Generelle bestemmelser Art. 12.2.2 e).</li>
                      <li>Det kan heller ikke utstedes engangslisens til person eller bil der det er gjeldende dom om suspensjon eller eksklusjon (Generelle bestemmelser Art. 9.6.3).</li>
                      <li className="font-bold">Lisensen skal være datert, og kun gyldig i en banedag.</li>
                    </ul>
                  </div>
                </div>

                {/* Logo */}
                <div className="flex justify-center pt-8 pb-4 border-t mt-auto">
                  <div className="w-[200px] h-[60px] relative">
                    <Image
                      src="/NBF_logo.png"
                      alt="NBF Logo"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="opacity-80"
                      priority
                    />
                  </div>
                </div>
                
                {/* Last ned denne lisensen */}
                {orders.length > 1 && (
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleDownloadReceipt(index)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Last ned kun denne lisensen (PDF)
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        ))}

        {/* Handlingsknapper under alle kvitteringer */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button 
            className="flex-1" 
            asChild
          >
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Handle flere lisenser
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleDownloadReceipt()}
          >
            <Download className="mr-2 h-4 w-4" />
            Last ned alle lisenser ({orders.length} separate PDFer)
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Laster...</span>
          </div>
        </div>
      }
    >
      <CompletePageContent />
    </Suspense>
  )
} 