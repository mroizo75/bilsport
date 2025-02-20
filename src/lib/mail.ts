import { Client } from 'postmark'

const client = new Client(process.env.POSTMARK_API_TOKEN!)

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
) {
  try {
    await client.sendEmail({
      From: process.env.POSTMARK_FROM_EMAIL!,
      To: to,
      Subject: 'Tilbakestill passord - Bilsportlisens.no',
      HtmlBody: `
        <html>
          <body>
            <h1>Tilbakestill ditt passord</h1>
            <p>Du har bedt om å tilbakestille passordet ditt på Bilsportlisens.no.</p>
            <p>Klikk på lenken under for å velge et nytt passord:</p>
            <p><a href="${resetLink}">Tilbakestill passord</a></p>
            <p>Hvis du ikke ba om dette, kan du trygt ignorere denne e-posten.</p>
            <p>Lenken er gyldig i 1 time.</p>
            <br>
            <p>Vennlig hilsen<br>Bilsportlisens.no</p>
          </body>
        </html>
      `,
      TextBody: `
        Tilbakestill ditt passord

        Du har bedt om å tilbakestille passordet ditt på Bilsportlisens.no.

        Bruk denne lenken for å velge et nytt passord:
        ${resetLink}

        Hvis du ikke ba om dette, kan du trygt ignorere denne e-posten.
        Lenken er gyldig i 1 time.

        Vennlig hilsen
        Bilsportlisens.no
      `,
      MessageStream: 'outbound'
    })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
} 