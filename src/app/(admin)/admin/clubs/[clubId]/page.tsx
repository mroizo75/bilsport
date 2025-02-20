"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"

interface Club {
  id: string
  name: string
  shortName: string
  email?: string
  phone?: string
  address?: string
  postalCode?: string
  city?: string
}

export default function EditClubPage({ params }: { params: { clubId: string } }) {
  const [club, setClub] = useState<Club | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await fetch(`/api/admin/clubs/${params.clubId}`)
        if (response.ok) {
          const data = await response.json()
          setClub(data)
        } else {
          toast({
            title: "Feil",
            description: "Kunne ikke hente klubbinformasjon",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching club:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClub()
  }, [params.clubId, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/clubs/${params.clubId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(club),
      })

      if (response.ok) {
        toast({
          title: "Lagret",
          description: "Klubbinformasjonen ble oppdatert",
        })
        router.push('/admin/clubs')
      } else {
        throw new Error('Kunne ikke oppdatere klubb')
      }
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke lagre endringene",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="container py-8">
        <p>Klubb ikke funnet</p>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rediger Klubb</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Klubbnavn</label>
              <Input
                value={club.name}
                onChange={(e) => setClub({ ...club, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kortnavn</label>
              <Input
                value={club.shortName}
                onChange={(e) => setClub({ ...club, shortName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">E-post</label>
              <Input
                type="email"
                value={club.email || ''}
                onChange={(e) => setClub({ ...club, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefon</label>
              <Input
                type="tel"
                value={club.phone || ''}
                onChange={(e) => setClub({ ...club, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Adresse</label>
              <Input
                value={club.address || ''}
                onChange={(e) => setClub({ ...club, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Postnummer</label>
                <Input
                  value={club.postalCode || ''}
                  onChange={(e) => setClub({ ...club, postalCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sted</label>
                <Input
                  value={club.city || ''}
                  onChange={(e) => setClub({ ...club, city: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lagre
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 