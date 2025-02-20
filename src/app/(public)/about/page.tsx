"use client"

import { Shell } from "@/components/shell"

export default function AboutPage() {
  return (
    <Shell>
      <div className="container max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        <h1 className="text-3xl font-bold mb-4">Om Oss</h1>
        <p className="leading-relaxed">
          Velkommen til Bilsportlisens! Her kan du lese om de spennende mulighetene
          innen motorsport, lisenser, og annet relatert innhold.
        </p>

        <p className="leading-relaxed">
          Vi brenner for motorsport og jobber kontinuerlig med å utvikle tjenester
          og verktøy som gjør det enklere for entusiaster å drive med dette.
        </p>

        <p className="leading-relaxed">
          Har du spørsmål, ta gjerne <a className="underline" href="/contact">kontakt med oss</a>.
        </p>
      </div>
    </Shell>
  )
} 