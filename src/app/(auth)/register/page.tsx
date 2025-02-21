"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Registrering feilet")
      }

      toast({
        title: "Konto opprettet",
        description: "Du kan nå logge inn",
      })
      
      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Noe gikk galt ved registrering. Prøv igjen senere.",
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
            Opprett ny konto
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Fyll ut informasjonen nedenfor for å opprette en konto
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={onSubmit}>
            <div className="grid gap-3 sm:gap-2">
              <div className="grid gap-1">
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  placeholder="Ola Nordmann"
                  type="text"
                  name="name"
                  autoCapitalize="none"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isLoading}
                  required
                  className="h-9 sm:h-10"
                />
              </div>
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
                  required
                  className="h-9 sm:h-10"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password">Passord</Label>
                <Input
                  id="password"
                  placeholder="********"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                  className="h-9 sm:h-10"
                />
              </div>
              <Button disabled={isLoading}>
                {isLoading && (
                  <div className="mr-2 h-4 w-4 animate-spin" />
                )}
                Registrer
              </Button>
            </div>
          </form>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Har du allerede en konto? Logg inn
          </Link>
        </p>
      </div>
    </div>
  )
} 