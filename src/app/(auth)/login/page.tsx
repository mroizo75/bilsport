"use client"

import { Suspense } from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/products'

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
        redirect: true,
        callbackUrl: callbackUrl
      })

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Feil ved innlogging",
          description: "E-post eller passord er feil",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Noe gikk galt. Prøv igjen senere.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex min-h-[80vh] w-full flex-col items-center justify-center px-4 sm:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:space-y-6 max-w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Logg inn på din konto
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Skriv inn din e-post og passord nedenfor
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={onSubmit}>
            <div className="grid gap-3 sm:gap-2">
              <div className="grid gap-1">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  placeholder="navn@eksempel.no"
                  type="email"
                  name="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="h-9 sm:h-10"
                />
              </div>
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Passord</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    Glemt passord?
                  </Link>
                </div>
                <Input
                  id="password"
                  placeholder="********"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
              <Button disabled={isLoading}>
                {isLoading && (
                  <div className="mr-2 h-4 w-4 animate-spin" />
                )}
                Logg inn
              </Button>
            </div>
          </form>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/register" className="hover:text-brand underline underline-offset-4">
            Ikke registrert? Opprett konto
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <LoginForm />
    </Suspense>
  )
} 