"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ContactDialogProps {
  triggerVariant?: "link" | "button"
  triggerLabel?: string
}

interface ContactFormState {
  name: string
  email: string
  message: string
}

interface ApiError {
  code: string
  message: string
}

export function ContactDialog({
  triggerVariant = "link",
  triggerLabel = "Kontakt oss",
}: ContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ContactFormState>({
    name: "",
    email: "",
    message: "",
  })
  const [honeypot, setHoneypot] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof ContactFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const resetState = () => {
    setForm({ name: "", email: "", message: "" })
    setHoneypot("")
    setSuccess(null)
    setError(null)
    setSubmitting(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState()
    }
    setOpen(nextOpen)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitting) {
      return
    }

    setSubmitting(true)
    setSuccess(null)
    setError(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          honeypot,
        }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: ApiError }
        const message =
          data?.error?.message ?? "Noe gikk galt. Prøv igjen senere."
        setError(message)
        setSubmitting(false)
        return
      }

      setSuccess("Meldingen er sendt. Vi svarer så snart vi kan.")
      setSubmitting(false)
      setForm({ name: "", email: "", message: "" })
    } catch {
      setError("Kunne ikke sende meldingen. Sjekk tilkoblingen og prøv igjen.")
      setSubmitting(false)
    }
  }

  const trigger =
    triggerVariant === "button" ? (
      <Button variant="outline" size="sm">
        {triggerLabel}
      </Button>
    ) : (
      <button
        type="button"
        className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
      >
        {triggerLabel}
      </button>
    )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kontakt oss</DialogTitle>
          <DialogDescription>
            Fyll inn skjemaet under så kommer vi tilbake til deg så fort som
            mulig.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="contact-name">Navn</Label>
            <Input
              id="contact-name"
              name="name"
              value={form.name}
              onChange={handleChange("name")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">E-post</Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Melding</Label>
            <Textarea
              id="contact-message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange("message")}
              required
            />
          </div>

          <div className="hidden">
            <Label htmlFor="website">Nettsted</Label>
            <Input
              id="website"
              name="website"
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              tabIndex={-1}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-emerald-600" role="status">
              {success}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sender..." : "Send melding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

