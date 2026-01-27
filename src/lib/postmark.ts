import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "")

interface WelcomeEmailProps {
  to: string
  name: string
  password: string
}

export async function sendWelcomeEmail({ to, name, password }: WelcomeEmailProps) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: to,
      subject: "Velkommen til Bilsportlisens",
      text: `Hei ${name},\n\nVelkommen til Bilsportlisens! Ditt brukernavn er ${to} og ditt passord er ${password}.\n\nLogg inn her: ${process.env.NEXT_PUBLIC_APP_URL}/login\n\nHilsen Bilsportlisens`,
      html: `<p>Hei <strong>${name}</strong>,</p>
        <p>Velkommen til Bilsportlisens! Ditt brukernavn er <strong>${to}</strong> og ditt passord er <strong>${password}</strong>.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Logg inn her</a></p>
        <p>Hilsen<br>Bilsportlisens</p>`,
    })
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    throw error
  }
}

interface LicenseReceiptProps {
  to: string
  customerName: string
  orderId: string
  licenseCount: number
  pdfAttachments: Array<{
    filename: string
    content: string // base64
  }>
}

export async function sendLicenseReceipt({
  to,
  customerName,
  orderId,
  licenseCount,
  pdfAttachments
}: LicenseReceiptProps) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: to,
      subject: `Kvittering for bilsportlisens - Ordre ${orderId}`,
      text: `Hei ${customerName},

Takk for ditt kjøp! 

Vi bekrefter hermed at din betaling er mottatt og at du har kjøpt ${licenseCount} lisens${licenseCount > 1 ? 'er' : ''}.

Hver lisens er vedlagt som en separat PDF-fil. Vennligst ta med den aktuelle lisensen til arrangementet.

VIKTIG:
• Lisensen(e) gjelder kun for angitt dato
• Må være godkjent av NBF
• Gyldig kun for den registrerte føreren og kjøretøyet

Hvis du har spørsmål, kontakt oss på ${process.env.RESEND_FROM_EMAIL}

Med vennlig hilsen
Bilsportlisens
Norges Bilsportforbund (NBF)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #22c55e; margin: 0;">✓</h1>
            <h2 style="color: #333; margin: 10px 0;">Betaling Gjennomført</h2>
          </div>
          
          <div style="padding: 20px; background-color: white;">
            <p>Hei <strong>${customerName}</strong>,</p>
            
            <p>Takk for ditt kjøp! Vi bekrefter hermed at din betaling er mottatt.</p>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
              <p style="margin: 0;"><strong>Ordrenummer:</strong> ${orderId}</p>
              <p style="margin: 10px 0 0 0;"><strong>Antall lisenser:</strong> ${licenseCount}</p>
            </div>
            
            <p>Hver lisens er vedlagt som en separat PDF-fil. Vennligst ta med den aktuelle lisensen til arrangementet.</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #856404;">⚠️ VIKTIG:</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                <li>Lisensen(e) gjelder kun for angitt dato</li>
                <li>Må være godkjent av NBF</li>
                <li>Gyldig kun for den registrerte føreren og kjøretøyet</li>
              </ul>
            </div>
            
            <p>Hvis du har spørsmål, kontakt oss på <a href="mailto:${process.env.RESEND_FROM_EMAIL}">${process.env.RESEND_FROM_EMAIL}</a></p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="text-align: center; color: #666; font-size: 12px;">
              Med vennlig hilsen<br>
              <strong>Bilsportlisens</strong><br>
              Norges Bilsportforbund (NBF)<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}">${process.env.NEXT_PUBLIC_APP_URL}</a>
            </p>
          </div>
        </div>
      `,
      attachments: pdfAttachments.map(pdf => ({
        filename: pdf.filename,
        content: pdf.content
      }))
    })
    
    console.log(`[EMAIL] License receipt sent to ${to} with ${pdfAttachments.length} PDFs`)
  } catch (error) {
    console.error("[EMAIL] Failed to send license receipt:", error)
    throw error
  }
} 