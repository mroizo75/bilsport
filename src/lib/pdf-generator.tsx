import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from '@react-pdf/renderer'
import path from 'path'
import fs from 'fs'

interface OrderDetails {
  orderId: string
  orderNumber: number
  totalOrders: number
  driverName: string
  vehicleReg: string
  customerEmail: string
  customerPhone: string
  totalAmount: number
  validFrom: string
  license: {
    name: string
    category: string
  }
  club: {
    name: string
  }
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 35,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#0066cc',
    marginBottom: 3,
  },
  orderNumber: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 12,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    textDecoration: 'underline',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    color: '#666666',
    width: '50%',
  },
  value: {
    fontSize: 9,
    color: '#000000',
    width: '50%',
    textAlign: 'right',
  },
  valueBold: {
    fontSize: 10,
    color: '#000000',
    width: '50%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  valueHighlight: {
    fontSize: 10,
    color: '#0066cc',
    width: '50%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
    textAlign: 'center',
  },
  disclaimerSubtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 6,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 8,
    color: '#78350f',
    marginBottom: 2,
    lineHeight: 1.3,
  },
  footer: {
    marginTop: 15,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 36,
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 2,
  },
  footerLink: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
})

const LicensePDFDocument = ({ order }: { order: OrderDetails }) => {
  // Bruk absolutt sti til logo
  const logoPath = path.resolve(process.cwd(), 'public', 'NBF_logo.png')
  
  // Les logo som base64 hvis den eksisterer
  let logoSrc: string | null = null
  try {
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath)
      logoSrc = `data:image/png;base64,${logoBuffer.toString('base64')}`
    }
  } catch (error) {
    console.error('[PDF] Could not load logo:', error)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header med checkmark */}
        <View style={styles.header}>
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
          <Text style={styles.title}>Betaling Gjennomført</Text>
          {order.totalOrders > 1 && (
            <Text style={styles.subtitle}>
              Lisens {order.orderNumber} av {order.totalOrders}
            </Text>
          )}
          <Text style={styles.orderNumber}>Ordrenummer: {order.orderId}</Text>
        </View>

        {/* Lisensdetaljer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LISENSDETALJER</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Hovedkategori:</Text>
            <Text style={styles.value}>{order.license.category}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lisenstype:</Text>
            <Text style={styles.value}>{order.license.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Klubb:</Text>
            <Text style={styles.value}>{order.club.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fører:</Text>
            <Text style={styles.valueBold}>{order.driverName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registreringsnummer:</Text>
            <Text style={styles.value}>{order.vehicleReg || 'Ikke registrert'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Race Dato:</Text>
            <Text style={styles.valueHighlight}>
              {new Date(order.validFrom).toLocaleDateString('no-NO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* Kontaktinformasjon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KONTAKTINFORMASJON</Text>
          <View style={styles.row}>
            <Text style={styles.label}>E-post:</Text>
            <Text style={styles.value}>{order.customerEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefon:</Text>
            <Text style={styles.value}>{order.customerPhone}</Text>
          </View>
        </View>

        {/* Betalingsinformasjon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BETALINGSINFORMASJON</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Beløp for denne lisensen:</Text>
            <Text style={styles.valueBold}>{order.totalAmount} kr</Text>
          </View>
        </View>

        {/* Viktig informasjon - disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>⚠️ VIKTIG INFORMASJON</Text>
          <Text style={styles.disclaimerSubtitle}>
            ENGANGSLISENSER FOR BANEDAG ETTER GODKJENNING AV NBF
          </Text>
          <Text style={styles.disclaimerText}>
            • Banedagen må være arrangert i henhold til NBFs reglement og av klubb/avdeling tilsluttet NBF.
          </Text>
          <Text style={styles.disclaimerText}>
            • For denne lisensen kreves IKKE medlemskap i klubb/avdeling tilsluttet NBF.
          </Text>
          <Text style={styles.disclaimerText}>
            • Fører er forsikret kun for gjeldende banedag.
          </Text>
          <Text style={styles.disclaimerText}>
            • Førerretten kan ikke være midlertidig tilbakekalt eller fratatt (Art. 12.2.2 e).
          </Text>
          <Text style={styles.disclaimerText}>
            • Kan ikke utstedes ved gjeldende suspensjon eller eksklusjon (Art. 9.6.3).
          </Text>
          <Text style={styles.disclaimerText}>
            • Lisensen er kun gyldig i én banedag.
          </Text>
        </View>

        {/* Footer med logo */}
        <View style={styles.footer}>
          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <View>
              <Text style={styles.footerText}>Norges Bilsportforbund (NBF)</Text>
              <Text style={styles.footerLink}>www.bilsportlisens.no</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}

export async function generateLicensePDF(order: OrderDetails): Promise<Buffer> {
  try {
    const pdfBuffer = await renderToBuffer(<LicensePDFDocument order={order} />)
    return pdfBuffer
  } catch (error) {
    console.error('[PDF] Error generating PDF:', error)
    throw error
  }
}
