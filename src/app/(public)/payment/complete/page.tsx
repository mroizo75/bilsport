"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Loader2, CheckCircle, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from "@/hooks/use-toast"
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
  const receiptRefs = useRef<(HTMLDivElement | null)[]>([])
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("paymentId") || searchParams.get("pid")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId || isVerified) return

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

        if (data.status === "COMPLETED") {
          clearCart()
          setOrders(data.orders || [])
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

  const handleDownloadReceipt = async () => {
    if (orders.length === 0 || !receiptRefs.current.length) return

    try {
      // Skjul knapper midlertidig
      const downloadButton = document.getElementById('downloadButton')
      const dashboardButton = document.getElementById('dashboardButton')
      if (downloadButton) downloadButton.style.display = 'none'
      if (dashboardButton) dashboardButton.style.display = 'none'

      // Vent på at bildene skal lastes
      await new Promise(resolve => setTimeout(resolve, 500))

      // Opprett PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Generer PDF for hver ordre
      for (let i = 0; i < orders.length; i++) {
        const receiptElement = receiptRefs.current[i]
        if (!receiptElement) continue

        const canvas = await html2canvas(receiptElement, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        })

        const imgData = canvas.toDataURL('image/png')
        if (i > 0) pdf.addPage()

        // Legg til marger i PDF
        const margin = 10
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = pdfWidth - (margin * 2)
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin,
          imgWidth,
          imgHeight
        )
      }

      // Gjenopprett knappene
      if (downloadButton) downloadButton.style.display = ''
      if (dashboardButton) dashboardButton.style.display = ''

      pdf.save(`kvittering-${orders[0].orderId.split('-')[0]}.pdf`)
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
            <div ref={(el: HTMLDivElement | null) => {
              if (el) {
                receiptRefs.current[index] = el
              }
            }} className="p-6">
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
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div className="flex justify-center pt-8 pb-4 border-t mt-auto">
                  <div className="w-[200px] h-[60px] relative">
                    <Image
                      src="/NBF_logo.png"
                      alt="Bilsportlisens Logo"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="opacity-80"
                      priority
                    />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}

        {/* Handlingsknapper under alle kvitteringer */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button 
            className="flex-1" 
            asChild
            id="dashboardButton"
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Til Mine Lisenser
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleDownloadReceipt}
            id="downloadButton"
          >
            <Download className="mr-2 h-4 w-4" />
            Last ned kvittering
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