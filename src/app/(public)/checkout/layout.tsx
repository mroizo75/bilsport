export const metadata = {
  title: 'Checkout - Bilsportlisens',
  description: 'Fullfør din bestilling',
  robots: {
    index: false,
    follow: false
  }
}

// Caching konfigurasjon
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 