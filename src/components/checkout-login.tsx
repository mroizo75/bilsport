"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function CheckoutLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  // Valgfritt: Om du vil lagre handlekurv i cookie
  const { items, total, addItem, removeItem } = useCart()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Feil ved innlogging",
          description: "E-post eller passord er feil"
        })
      } else {
        // Oppdater siden for å hente ny session
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Noe gikk galt. Prøv igjen senere."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Logg inn
        </h2>

        {/* Eksempel på handlekurv-listing (valgfritt) */}
        {items.length > 0 && (
          <div className="border rounded-md p-2">
            <p>Handlekurv:</p>
            {items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span>{formatPrice(item.price)}</span>
                <TrashIcon onClick={() => removeItem(item.id)} />
              </div>
            ))}
            <div className="font-bold">
              Total: {formatPrice(total)}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="din@epost.no"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Passord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logger inn...
              </>
            ) : (
              "Logg inn"
            )}
          </Button>
        </form>

        <div className="space-y-2 text-center">
          <p className="text-sm">
            Har du ikke konto?{" "}
            <Link 
              href="/register" 
              className="text-primary hover:underline font-medium"
            >
              Registrer deg her
            </Link>
          </p>
          <p className="text-sm">
            <Link 
              href="/forgot-password" 
              className="text-muted-foreground hover:underline"
            >
              Glemt passord?
            </Link>
          </p>
        </div>
      </div>
    </Card>
  )
} 