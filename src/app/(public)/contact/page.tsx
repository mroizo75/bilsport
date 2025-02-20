"use client"

import { Shell } from "@/components/shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <Shell>
      <div className="container max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <h1 className="text-3xl font-bold">Kontakt Oss</h1>
        <p className="leading-relaxed">
          Vi vil gjerne høre fra deg! Fyll ut skjemaet nedenfor, eller send oss en
          e-post. Vi gjør vårt beste for å svare innen 24 timer.
        </p>

        <form className="max-w-md space-y-4">
          <div>
            <Label htmlFor="name">Navn</Label>
            <Input type="text" id="name" name="name" placeholder="Ditt navn" required />
          </div>

          <div>
            <Label htmlFor="email">E-post</Label>
            <Input type="email" id="email" name="email" placeholder="Din e-postadresse" required />
          </div>

          <div>
            <Label htmlFor="message">Melding</Label>
            <Textarea id="message" name="message" placeholder="Din melding..." rows={6} required />
          </div>

          <Button type="submit">Send</Button>
        </form>
      </div>
    </Shell>
  )
} 