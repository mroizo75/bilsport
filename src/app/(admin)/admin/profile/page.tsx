"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  // utvid med evt. andre felter du har i databasen
}

export default function AdminProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 1) Sjekk om vi er innlogget som Admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
      return
    }
    
    if (session?.user?.role !== "ADMIN") {
      // Hvis brukeren ikke er admin, send dem bort
      router.replace("/")
      return
    }
  }, [status, session, router])

  // 2) Hent eksisterende info om profilen
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/admin/profile")
        if (!res.ok) {
          throw new Error("Kunne ikke hente brukerinformasjon")
        }
        const data = await res.json()
        setProfile(data.user)
      } catch (error) {
        console.error("fetchUserProfile:", error)
      } finally {
        setIsLoading(false)
      }
    }
    if (session?.user?.role === "ADMIN") {
      fetchUserProfile()
    }
  }, [session])

  // 3) Håndter innsending av skjema
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profile) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      })
      if (!res.ok) {
        throw new Error("Kunne ikke oppdatere bruker")
      }
      toast({ 
        title: "Profil oppdatert",
        description: "Dine endringer er lagret."
      })
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere profil",
        variant: "destructive"
      })
      console.error("handleSubmit error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="p-4">Laster session...</div>
  }

  if (!profile) {
    return (
      <div className="p-4">
        {isLoading ? "Laster profil..." : "Ingen profil å vise"}
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-4">
      <h1 className="text-3xl font-bold">Min profil (Admin)</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {/* Navn */}
        <div>
          <Label>Navn</Label>
          <Input
            type="text"
            value={profile.name}
            onChange={(e) =>
              setProfile({ ...profile, name: e.target.value })
            }
            required
          />
        </div>

        {/* E-post */}
        <div>
          <Label>E-post</Label>
          <Input
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile({ ...profile, email: e.target.value })
            }
            required
          />
        </div>

        {/* Telefon */}
        <div>
          <Label>Telefon</Label>
          <Input
            type="tel"
            value={profile.phone || ""}
            onChange={(e) =>
              setProfile({ ...profile, phone: e.target.value })
            }
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Oppdaterer..." : "Lagre endringer"}
        </Button>
      </form>
    </div>
  )
} 