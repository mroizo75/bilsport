"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (response.status === 429) {
        const data = await response.json()
        toast({
          title: "For mange forsøk",
          description: `Prøv igjen senere. Tilgjengelig om ${Math.ceil((data.resetTime - Date.now()) / 1000 / 60)} minutter.`,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "E-post sendt",
        description: "Hvis kontoen eksisterer, vil du motta en e-post med instruksjoner for å tilbakestille passordet."
      })
    } catch (error) {
      toast({
        title: "Noe gikk galt",
        description: "Kunne ikke sende tilbakestillings-e-post.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-[80vh] w-full flex-col items-center justify-center px-4 sm:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:space-y-6 max-w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Glemt passord?</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Skriv inn e-postadressen din for å tilbakestille passordet
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid gap-3 sm:gap-2">
            <Input
              type="email"
              placeholder="din@epost.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 sm:h-10"
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Sender..." : "Send tilbakestillings-e-post"}
            </Button>
          </div>
        </form>

        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Tilbake til innlogging
          </Link>
        </p>
      </div>
    </div>
  )
} 