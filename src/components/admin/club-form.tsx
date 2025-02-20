"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { mutate } from 'swr'

const clubFormSchema = z.object({
  name: z.string().min(2, "Klubbnavn må være minst 2 tegn"),
  shortName: z.string().min(2, "Forkortelse må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse").optional().or(z.literal('')),
  phone: z.string().regex(/^\d{8}$/, "Telefonnummer må være 8 siffer").optional().or(z.literal('')),
})

export function ClubForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof clubFormSchema>>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: {
      name: "",
      shortName: "",
      email: "",
      phone: "",
    },
  })

  async function onSubmit(data: z.infer<typeof clubFormSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Noe gikk galt")
      }

      // Revalidate data
      mutate('/api/admin/clubs')

      toast({
        title: "Klubb opprettet",
        description: "Klubben ble lagt til",
      })
      
      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke opprette klubb. Prøv igjen senere.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Klubbnavn</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="F.eks. Norsk Motor Klubb Oslo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shortName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forkortelse</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="F.eks. NMK Oslo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-post (valgfritt)</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="klubb@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon (valgfritt)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="8 siffer" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin" />
          )}
          Legg til klubb
        </Button>
      </form>
    </Form>
  )
} 