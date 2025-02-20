"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession, signIn } from "next-auth/react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { TermsDialog } from "@/components/terms-dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrashIcon } from "lucide-react"
import { Shell } from "@/components/shell"
import { CheckoutLogin } from "@/components/checkout-login"

const steps = [
  { id: "info", name: "Informasjon" },
  { id: "payment", name: "Betaling" },
  { id: "confirmation", name: "Bekreftelse" },
]

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState("info")
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [phone, setPhone] = useState("+47")
  const { items, total, clearCart, removeItem, addItem } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.phone) {
      setPhone(session.user.phone)
    }
  }, [session])

  useEffect(() => {
    // Gjenopprett handlekurven etter innlogging
    const savedCart = localStorage.getItem('savedCart')
    if (session && savedCart) {
      console.log("Restoring saved cart after login")
      try {
        const cartItems = JSON.parse(savedCart)
        
        // Tøm eksisterende handlekurv først
        clearCart()
        
        // Legg til alle lagrede produkter
        cartItems.forEach((item: any) => {
          console.log("Adding item to cart:", item)
          const cartItemId = `${item.licenseId}-${Date.now()}`
          addItem({
            ...item,
            id: cartItemId
          })
        })
        
        // Fjern lagret handlekurv
        localStorage.removeItem('savedCart')
        
        console.log("Cart restored successfully")
      } catch (error) {
        console.error("Error restoring cart:", error)
      }
    }
  }, [session, addItem, clearCart])

  if (items.length === 0) {
    router.push("/")
    return null
  }

  // Hvis ikke innlogget, vis CheckoutLogin komponenten
  if (!session) {
    return (
      <Shell>
        <div className="container max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-background rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Checkout</h1>
              <Button 
                variant="outline"
                onClick={() => router.push("/")}
              >
                Fortsett å handle
              </Button>
            </div>
            <CheckoutLogin />
          </div>
        </div>
      </Shell>
    )
  }

  // Funksjon for å sjekke om telefonnummer er gyldig
  function isPhoneValid(ph: string) {
    // Må starte med "+47", og deretter 8 siffer
    if (!ph.startsWith("+47")) return false
    const digits = ph.slice(3) // resten etter +47
    return digits.length === 8 && /^[0-9]+$/.test(digits)
  }

  const handlePayment = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Vilkår ikke godkjent",
        description: "Du må godta vilkårene for å fortsette.",
        variant: "destructive",
      })
      return
    }

    if (!phone) {
      toast({
        title: "Mangler telefonnummer",
        description: "Vennligst oppgi et telefonnummer for å fortsette.",
        variant: "destructive",
      })
      return
    }

    if (!isPhoneValid(phone)) {
      toast({
        title: "Ugyldig telefonnummer",
        description: "Telefonnummeret må begynne med +47 og inneholde 8 siffer.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log("1. Starting payment process")
      console.log("2. Cart items:", JSON.stringify(items, null, 2))
      
      // Konverter handlekurvens items til riktig format for API-et
      const licenses = items.map(item => ({
        licenseId: item.licenseId,
        clubId: item.clubId,
        startDate: item.startDate,
        endDate: item.endDate,
        price: Number(item.price),
        driverName: item.driverName,
        name: item.name,
        category: item.category,
        subType: item.subType,
        vehicleReg: item.vehicleReg
      }))

      console.log("3. Prepared licenses:", JSON.stringify(licenses, null, 2))

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          customerInfo: {
            firstName: session?.user?.name?.split(' ')[0] || '',
            lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
            email: session?.user?.email || '',
            phone: phone,
          },
          licenses: licenses
        })
      })

      const data = await response.json()
      console.log("4. Response data:", data)
      
      if (data.error) {
        throw new Error(data.error)
      }

      window.location.href = data.checkoutUrl
      
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Betalingen feilet",
        description: (error as Error).message || "Kunne ikke starte betalingsprosessen. Prøv igjen senere.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Shell>
      <div className="container space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="bg-background rounded-lg shadow-lg p-6 space-y-8">
          {/* Legg til knappen øverst */}
          <div className="flex justify-end">
            <Button 
              variant="outline"
              onClick={() => router.push("/")}
              className="mb-4"
            >
              Fortsett å handle
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <nav aria-label="Progress">
              <ol role="list" className="flex items-center justify-center">
                {steps.map((step, stepIdx) => (
                  <li 
                    key={step.id}
                    className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`
                          relative flex h-8 w-8 items-center justify-center rounded-full
                          ${currentStep === step.id ? 'border-2 border-primary bg-background' : ''}
                          ${steps.findIndex(s => s.id === currentStep) > stepIdx ? 'bg-primary' : 'bg-muted'}
                        `}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${currentStep === step.id ? 'bg-primary' : 'bg-transparent'}`} />
                      </div>
                      {stepIdx !== steps.length - 1 && (
                        <div className={`absolute top-4 w-full h-[2px] -right-4 sm:-right-16 ${steps.findIndex(s => s.id === currentStep) > stepIdx ? 'bg-primary' : 'bg-muted'}`} />
                      )}
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className={`text-sm ${currentStep === step.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {step.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {currentStep === "info" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <Card key={item.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{item.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              {item.category} - {item.subType}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Fører: {item.driverName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Reg.nr: {item.vehicleReg}
                            </p>
                            {item.startDate && (
                              <p className="text-sm text-muted-foreground">
                                Gyldig: {new Date(item.startDate).toLocaleDateString()}
                                {item.endDate && ` - ${new Date(item.endDate).toLocaleDateString()}`}
                              </p>
                            )}
                          </div>
                          <p className="font-medium mt-2">{formatPrice(item.price)}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Vilkår for kjøp */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Jeg har lest og godtar <TermsDialog />
                        </label>
                        {!acceptedTerms && (
                          <p className="text-sm text-muted-foreground">
                            Du må godta salgsbetingelsene for å fortsette
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefonnummer</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+47XXXXXXXX"
                      required
                    />
                    {!isPhoneValid(phone) && (
                      <p className="text-xs text-red-600 mt-1">
                        Telefonnummer må begynne med +47 og inneholde 8 siffer.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        variant="outline"
                        className="w-full sm:w-1/2"
                        onClick={() => router.push("/")}
                      >
                        Fortsett å handle
                      </Button>
                      <Button 
                        className="w-full sm:w-1/2"
                        onClick={() => setCurrentStep("payment")}
                        disabled={!acceptedTerms}
                      >
                        Fortsett til betaling
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "payment" && (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-semibold mb-4">Oppsummering</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.category} - {item.subType}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Fører: {item.driverName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Reg.nr: {item.vehicleReg}
                            </p>
                            {item.startDate && (
                              <p className="text-sm text-muted-foreground">
                                Gyldig: {new Date(item.startDate).toLocaleDateString()}
                                {item.endDate && ` - ${new Date(item.endDate).toLocaleDateString()}`}
                              </p>
                            )}
                          </div>
                          <p className="font-medium">{formatPrice(item.price)}</p>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Behandler betaling...
                      </>
                    ) : (
                      'Betal nå'
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Ved å klikke “Bekreft kjøp” samtykker du til våre <TermsDialog />.
          </p>
        </div>

        <div className="mt-4">
          <Button 
            className="w-full"
            onClick={handlePayment}
            disabled={!acceptedTerms || !isPhoneValid(phone) || isLoading}
          >
            Bekreft kjøp
          </Button>
        </div>
      </div>
    </Shell>
  )
} 