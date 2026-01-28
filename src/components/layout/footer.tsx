import Image from "next/image"
import Link from "next/link"
import { ContactDialog } from "@/components/contact-dialog"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Logo på venstre side */}
          <div className="flex items-center justify-center md:justify-start pl-10">
            <Image 
              src="/NBF_logo.png" 
              alt="Bilsportlisens.no" 
              width={150} 
              height={150}
            />
          </div>

          {/* Lenker i midten */}
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-4 text-center md:flex md:gap-16">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Om oss</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                    Om Bilsportlisens
                  </Link>
                </li>
                <li className="flex justify-center">
                  <ContactDialog triggerVariant="link" triggerLabel="Kontakt oss" />
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Lisenser</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/products" className="text-sm text-muted-foreground hover:text-primary">
                    Våre lisenser
                  </Link>
                </li>
                <li>
                  <Link href="/activity" className="text-sm text-muted-foreground hover:text-primary">
                    Aktiviteter
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Hjelp</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-muted-foreground hover:text-primary">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Juridisk</h4>
              <ul className="space-y-1">
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                    Personvern
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                    Vilkår
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Tom div for å balansere layouten */}
          <div className="hidden md:block" style={{ width: '150px' }}></div>
        </div>

        {/* Copyright og KKS info i bunnen */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground space-y-2">
          <p>© {new Date().getFullYear()} Bilsportlisens.no. Alle rettigheter reservert.</p>
          <p>
            Utviklet av{" "}
            <a
              href="https://kksas.no"
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:text-primary"
            >
              KKS AS
            </a>
            {" "}for{" "}
            <a
              href="https://bilsport.no"
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:text-primary"
            >
              Norges Bilsportforbund
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
} 