import { Shell } from "@/components/shell"

export default function TermsPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl py-8 px-4 md:px-8">
        <div className="space-y-4 text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Vilkår</h1>
        </div>

        <div className="bg-card rounded-lg p-6 md:p-8 border prose prose-sm max-w-none">
          <p>
            Ved å bruke Bilsportlisens.no aksepterer du følgende vilkår:
          </p>

          <p>
            Bilsportlisens.no er en tjeneste levert av Norges Bilsportforbund (NBF). 
            Tjenesten er ment for kjøp og administrasjon av lisenser for motorsport i Norge.
          </p>

          <p>
            All bruk av tjenesten skal skje i henhold til gjeldende lover og regler for motorsport i Norge. 
            Du er selv ansvarlig for at informasjonen du oppgir er korrekt og at du oppfyller kravene for den lisensen du søker om.
          </p>

          <p>
            Norges Bilsportforbund forbeholder seg retten til å endre vilkårene for bruk av tjenesten. 
            Eventuelle endringer vil bli publisert på denne siden.
          </p>

          <p className="text-muted-foreground text-sm mt-8">
            Sist oppdatert: {new Date().toLocaleDateString('no-NO')}
          </p>
        </div>
      </div>
    </Shell>
  )
} 