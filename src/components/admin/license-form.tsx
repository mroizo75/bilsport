"use client"

import { useState } from "react"
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
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { mutate } from 'swr'
import { LICENSE_TYPES, type LicenseCategory } from "@/lib/constants/license-types"

const licenseFormSchema = z.object({
  category: z.string().min(1, "Velg hovedkategori"),
  subType: z.string().min(1, "Velg underkategori"),
  name: z.string().min(2, "Skriv inn lisensnavn"),
  description: z.string().min(10, "Legg til en beskrivelse"),
  price: z.string().regex(/^\d+$/, "Må være et tall"),
  duration: z.string().min(1, "Velg varighet"),
  requirements: z.string().optional(),
})

export function LicenseForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<LicenseCategory | "">("")

  const form = useForm<z.infer<typeof licenseFormSchema>>({
    resolver: zodResolver(licenseFormSchema),
    defaultValues: {
      category: "",
      subType: "",
      name: "",
      description: "",
      price: "",
      duration: "365",
      requirements: "",
    },
  })

  // Reset subType når category endres
  const onCategoryChange = (value: LicenseCategory) => {
    setSelectedCategory(value)
    form.setValue("category", value)
    form.setValue("subType", "")
  }

  async function onSubmit(data: z.infer<typeof licenseFormSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Noe gikk galt")
      }

      mutate('/api/admin/licenses')
      toast({
        title: "Lisens opprettet",
        description: "Lisensen ble lagt til",
      })
      
      form.reset()
      setSelectedCategory("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke opprette lisens",
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hovedkategori</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value: LicenseCategory) => onCategoryChange(value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg hovedkategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LICENSE_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Underkategori</FormLabel>
                <Select
                  disabled={!selectedCategory}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg underkategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedCategory && LICENSE_TYPES[selectedCategory].subTypes.map((subType) => (
                      <SelectItem key={subType.value} value={subType.value}>
                        {subType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lisensnavn</FormLabel>
              <FormControl>
                <Input {...field} placeholder="F.eks. Banedag Racing" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Beskrivelse av lisensen og hva den kan brukes til"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pris (NOK)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0" />
                </FormControl>
                <FormDescription>
                  Standard priser: 220kr, 450kr eller 100kr
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Varighet (dager)</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg varighet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 dag</SelectItem>
                    <SelectItem value="7">7 dager</SelectItem>
                    <SelectItem value="30">30 dager</SelectItem>
                    <SelectItem value="365">1 år</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Krav (valgfritt)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Eventuelle krav eller begrensninger for lisensen"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin" />
          )}
          Opprett lisens
        </Button>
      </form>
    </Form>
  )
} 