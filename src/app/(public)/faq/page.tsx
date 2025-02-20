"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Shell } from "@/components/shell"

interface LicenseType {
  title: string
  description: string
  content: string
}

const licenseTypes: LicenseType[] = [
  {
    title: "ENGANGSLISENSER FOR BANEDAG",
    description: "ETTER GODKJENNING AV NORGES BILSPORTFORBUND (NBF)",
    content: `Banedagen må være arrangert i henhold til NBFs reglement og av klubb/avdeling tilsluttet NBF.
    
For denne lisensen kreves IKKE medlemskap i klubb/avdeling tilsluttet NBF.

Fører er gjennom denne lisensen forsikret på samme måte som ved vanlig helårslisens, men kun for gjeldende banedag.

For å få utstedt engangslisens kan ikke førerretten for førerkortfri motorvogn være midlertidig tilbakekalt eller fratatt føreren, Generelle bestemmelser Art. 12.2.2 e. Det kan heller ikke utstedes engangslisens til person eller bil der det er gjeldende dom om suspensjon eller eksklusjon. Generelle bestemmelser Art. 9.6.3.

Lisensen skal være datert, og kun gyldig i en banedag.`
  },
  {
    title: "ENGANGSLISENS FOR AUTOSLALÅM-LØP OG FORENKLEDE KONKURANSEFORMER",
    description: "ETTER GODKJENNING AV NORGES BILSPORTFORBUND (NBF)",
    content: `Løpet må arrangeres i henhold til NBFs reglement og av klubb/avdeling tilsluttet NBF.

For denne lisensen kreves IKKE medlemskap i klubb/avdeling tilsluttet NBF.

Fører/ledsager er gjennom denne lisensen forsikret på samme måte som ved vanlig helårslisens, men kun for gjeldende løp.
Lisensen skal være datert, og kun gyldig i ett løp.
Deltagere som kjører med engangslisens kan ikke oppnå plassering på resultatlisten eller premieres.

    a) For løp som ikke er NM eller NC gjøres det unntak for Økonomiløp, Autoslalåm, Street Legal og Bil-O/Challenge.
    b) Unntaket gjelder også for rene klubbløp der kun arrangørklubbens medlemmer deltar.
    c) For Biltrial og Terrengtouring, se egne bestemmelser i spesialreglementene.

For å få utstedt engangslisens kan ikke førerretten for førerkortfri motorvogn være midlertidig tilbakekalt eller fratatt føreren, Generelle bestemmelser Art. 12.2.2 e. Det kan heller ikke utstedes engangslisens til person eller bil der det er gjeldende dom om suspensjon eller eksklusjon. Generelle bestemmelser Art. 9.6.3.

Lisenskvitteringen skal vises til den arrangerende klubb før du deltar på konkurransen.`
  },
  {
    title: "ENGANGSLISENS FOR LØP",
    description: "ETTER GODKJENNING AV NORGES BILSPORTFORBUND (NBF)",
    content: `Løpet må arrangeres i henhold til NBFs reglement og av klubb/avdeling tilsluttet NBF.

For denne lisensen kreves IKKE medlemskap i klubb/avdeling tilsluttet NBF.

Fører/ledsager er gjennom denne lisensen forsikret på samme måte som ved vanlig helårslisens, men kun for gjeldende løp.
Lisensen skal være datert, og kun gyldig i ett løp.
Deltagere som kjører med engangslisens kan ikke oppnå plassering på resultatlisten eller premieres.

    a) For løp som ikke er NM eller NC gjøres det unntak for Økonomiløp, Autoslalåm, Street Legal og Bil-O/Challenge.
    b) Unntaket gjelder også for rene klubbløp der kun arrangørklubbens medlemmer deltar.
    c) For Biltrial og Terrengtouring, se egne bestemmelser i spesialreglementene.

For å få utstedt engangslisens kan ikke førerretten for førerkortfri motorvogn være midlertidig tilbakekalt eller fratatt føreren, Generelle bestemmelser Art. 12.2.2 e. Det kan heller ikke utstedes engangslisens til person eller bil der det er gjeldende dom om suspensjon eller eksklusjon. Generelle bestemmelser Art. 9.6.3.

Lisenskvitteringen skal vises til den arrangerende klubb før du deltar på konkurransen.`
  },
  {
    title: "ENGANGSLISENS FOR PASSASJER/LEDSAGER UNDER LØP ELLER TRENING",
    description: "ETTER GODKJENNING AV NORGES BILSPORTFORBUND (NBF)",
    content: `Lisensen skal være datert, og kun gyldig i ett løp.
Løpet eller treningen må være arrangert i henhold til NBFs reglement og av klubb/avdeling tilsluttet NBF.
For denne lisensen kreves IKKE medlemskap i klubb/avdeling tilsluttet NBF.
Passasjer/ledsager er gjennom denne lisensen forsikret på samme måte som ved vanlig helårslisens, men kun for gjeldende ett løp.
Det kan ikke utstedes engangslisens til person det er gjeldende dom om suspensjon eller eksklusjon

Lisenskvitteringen skal vises til den arrangerende klubb før du deltar.`
  },
  {
    title: "ENGANGSLISENSER FOR TEST",
    description: "ETTER GODKJENNING AV NORGES BILSPORTFORBUND (NBF)",
    content: `Testen må være arrangert i henhold til NBFs reglement og av klubb/avdeling tilsluttet NBF.
For denne lisensen kreves IKKE medlemskap i klubb/avdeling tilsluttet NBF.
Fører er gjennom denne lisensen forsikret på samme måte som ved vanlig helårslisens, men kun for gjeldene test.

Lisensen dekker fører og bil. Det er ikke krav om årskontroll/lisens på bilen men den skal være iht gjeldende teknisk reglement.

For å få utstedt engangslisens kan ikke førerretten for førerkortfri motorvogn være midlertidig tilbakekalt eller fratatt føreren, Generelle bestemmelser Art. 12.2.2 e. Det kan heller ikke utstedes engangslisens til person eller bil der det er gjeldende dom om suspensjon eller eksklusjon. Generelle bestemmelser Art. 9.6.3.`
  },
  {
    title: "ENGANGSLISENSER FOR TRENING",
    description: "ETTER GODKJENNING AV NORGES BILSPORTFORBUND (NBF)",
    content: `Treningen må arrangeres i henhold til NBFs reglement og av klubb/avdeling tilsluttet NBF.
For denne lisensen kreves IKKE medlemskap i klubb/avdeling tilsluttet NBF.
Fører er gjennom denne lisensen forsikret på samme måte som ved vanlig helårslisens, men kun for gjeldene trening.

Samme krav om personlig utstyr gjelder for passasjer som til fører i gjeldende bilsportgren.
Ved fører og passasjer i en og samme bil, må begge løse HVER sin lisens.
Lisensen skal være datert, og kun gyldig i en trening.

For å få utstedt engangslisens kan ikke førerretten for motorvogn være midlertidig tilbakekalt eller fratatt føreren, Generelle bestemmelser Art. 12.2.2 e. Det kan heller ikke utstedes engangslisens til person eller bil der det er gjeldende dom om suspensjon eller eksklusjon. Generelle bestemmelser Art. 9.6.3.

Lisenskvitteringen skal vises til den arrangerende klubb før du deltar på treningen.
`
  },
  // ... Legg til resten av lisenstypene her
]

export default function LicenseTypesPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl py-8 px-4 md:px-8">
        <div className="space-y-4 text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Lisenstyper</h1>
          <p className="text-muted-foreground text-lg">
            Informasjon om ulike lisenstyper og deres betingelser
          </p>
        </div>

        <div className="space-y-4 bg-card rounded-lg p-4 md:p-6 border">
          <Accordion type="single" collapsible className="w-full">
            {licenseTypes.map((license, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="space-y-1">
                    <div className="font-semibold">{license.title}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {license.description}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-line prose prose-sm max-w-none">
                  {license.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Shell>
  )
} 