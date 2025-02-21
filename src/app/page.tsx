"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shell } from "@/components/shell"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/products')
    }
  }, [session, router])

  return (
    <Shell>
      <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 py-6 sm:py-8 space-y-8 sm:space-y-12">
        {/* Logo og Tittel */}
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-[200px] h-[60px] relative mx-auto mb-8">
            <Image
              src="/NBF_logo.png"
              alt="Bilsportlisens Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl px-2">
            Engangslisenser
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-base sm:text-lg md:text-xl px-2">
            Kjøp engangslisenser enkelt og raskt for racing og banekjøring
          </p>
        </div>

        {/* Valg Kort */}
        <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 w-full max-w-2xl">
          {/* Eksisterende Bruker */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-card border rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">Har du en konto?</h2>
              <p className="text-muted-foreground">
                Logg inn for å kjøpe lisenser eller se dine eksisterende lisenser
              </p>
              <Button className="w-full" asChild>
                <Link href="/login">Logg inn</Link>
              </Button>
            </div>
          </div>

          {/* Ny Bruker */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-card border rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">Ny bruker?</h2>
              <p className="text-muted-foreground">
                Opprett en konto for å komme i gang med dine første lisenser
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/register">Registrer deg</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Ekstra Info */}
        <div className="text-center text-sm text-muted-foreground mt-4 sm:mt-0">
          <p>
            Trenger du hjelp? {" "}
            <Link href="/support" className="underline underline-offset-4 hover:text-primary">
              Spør AI
            </Link>
          </p>
        </div>
      </div>
    </Shell>
  )
}
