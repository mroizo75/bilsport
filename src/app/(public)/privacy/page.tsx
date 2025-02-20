"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Shell } from "@/components/shell"

interface PrivacySection {
  title: string
  content: string
}

const privacySections: PrivacySection[] = [
  {
    title: "Personvernerklæring",
    content: `Bilsportlisens.no tar personvern på alvor. Denne erklæringen beskriver hvordan vi samler inn, bruker og beskytter dine personopplysninger.

1. Innsamling av personopplysninger
- Navn og kontaktinformasjon
- Fødselsdato
- Klubbtilhørighet
- Lisenshistorikk
- Betalingsinformasjon

2. Bruk av personopplysninger
- Administrering av lisenser
- Kommunikasjon om dine lisenser og medlemskap
- Behandling av betalinger
- Statistikk og forbedring av tjenesten

3. Deling av personopplysninger
Vi deler kun dine opplysninger med:
- Norges Bilsportforbund (NBF)
- Din lokale klubb
- Betalingstjenesteleverandører
`
  },
  {
    title: "Brukervilkår",
    content: `1. Generelle vilkår
- Bilsportlisens.no er en tjeneste for kjøp og administrasjon av lisenser for motorsport
- Tjenesten er kun tilgjengelig for personer som oppfyller kravene for lisens

2. Ditt ansvar
- Du er ansvarlig for at informasjonen du oppgir er korrekt
- Du må følge gjeldende regler og forskrifter for motorsport
- Du må ikke misbruke tjenesten eller dele din konto med andre

3. Betaling og refusjon
- Alle priser er oppgitt i norske kroner inkludert mva
- Betaling skjer via godkjente betalingsløsninger
- Refusjon gis kun i henhold til gjeldende regelverk

4. Endringer i vilkår
Vi forbeholder oss retten til å endre vilkårene med rimelig varsel.
`
  },
  {
    title: "Informasjonskapsler (Cookies)",
    content: `Vi bruker informasjonskapsler for å:
- Huske dine innstillinger
- Forbedre brukeropplevelsen
- Analysere bruk av nettsiden
- Sikre funksjonalitet i tjenesten

Du kan når som helst endre innstillinger for informasjonskapsler i din nettleser.`
  }
]

export default function PrivacyPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl py-8 px-4 md:px-8">
        <div className="space-y-4 text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Personvern og Vilkår</h1>
          <p className="text-muted-foreground text-lg">
            Informasjon om hvordan vi behandler dine personopplysninger og vilkår for bruk av tjenesten
          </p>
        </div>

        <div className="space-y-4 bg-card rounded-lg p-4 md:p-6 border">
          <Accordion type="single" collapsible className="w-full">
            {privacySections.map((section, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="font-semibold">{section.title}</div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-line prose prose-sm max-w-none">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Shell>
  )
} 