export const metadata = {
  title: 'Betalingsbekreftelse',
  description: 'Kvittering for din bestilling',
  robots: {
    index: false,
    follow: false
  }
}

// Caching konfigurasjon
export const revalidate = 3600 // Cache i 1 time
export const dynamic = 'force-static'

export default function PaymentCompleteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 