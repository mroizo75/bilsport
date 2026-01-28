import { Shell } from "@/components/shell"
import { ContactDialog } from "@/components/contact-dialog"

export default function ContactPage() {
  return (
    <Shell>
      <div className="container max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <h1 className="text-3xl font-bold">Kontakt Oss</h1>
        <p className="leading-relaxed">
          Vi vil gjerne høre fra deg! Klikk på knappen under for å åpne
          kontaktskjemaet.
        </p>

        <ContactDialog triggerVariant="button" triggerLabel="Åpne kontaktskjema" />
      </div>
    </Shell>
  )
} 