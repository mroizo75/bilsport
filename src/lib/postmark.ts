import { ServerClient } from "postmark"

const client = new ServerClient(process.env.POSTMARK_API_TOKEN || "")

interface WelcomeEmailProps {
  to: string
  name: string
  password: string
}

export async function sendWelcomeEmail({ to, name, password }: WelcomeEmailProps) {
  try {
    await client.sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL || "no-reply@dindomene.no",
      To: to,
      Subject: "Velkommen til Bilsportlisens",
      TextBody: `Hei ${name},\n\nVelkommen til Bilsportlisens! Ditt brukernavn er ${to} og ditt passord er ${password}.\n\nLogg inn her: ${process.env.NEXT_PUBLIC_APP_URL}/login\n\nHilsen Bilsportlisens`,
      HtmlBody: `<p>Hei <strong>${name}</strong>,</p>
        <p>Velkommen til Bilsportlisens! Ditt brukernavn er <strong>${to}</strong> og ditt passord er <strong>${password}</strong>.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Logg inn her</a></p>
        <p>Hilsen<br>Bilsportlisens</p>`,
    })
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    throw error
  }
} 