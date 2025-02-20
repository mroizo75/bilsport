"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState({ phone: '' })

  // Hent brukerdata når komponenten lastes
  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    }
    fetchUserData()
  }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      })

      if (!response.ok) throw new Error()

      await update()
      toast({
        title: "Profil oppdatert",
        description: "Dine endringer er lagret"
      })
    } catch {
      toast({
        title: "Noe gikk galt",
        description: "Kunne ikke oppdatere profilen",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil Innstillinger</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Navn</Label>
              <Input 
                id="name" 
                name="name"
                defaultValue={session?.user?.name || ''} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input 
                id="email" 
                type="email"
                defaultValue={session?.user?.email || ''}
                disabled 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                name="phone"
                type="tel"
                defaultValue={userData.phone || ''} 
                placeholder="+47 123 45 678"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Lagrer..." : "Lagre endringer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endre passord</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Nåværende passord</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nytt passord</Label>
              <Input id="new-password" type="password" />
            </div>
            <Button type="submit">Endre passord</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 