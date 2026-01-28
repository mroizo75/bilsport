import { NextResponse } from "next/server"
import { Resend } from "resend"
import { rateLimiter } from "@/lib/rate-limit"

const resend = new Resend(process.env.RESEND_API_KEY || "")

interface ContactPayload {
  name: string
  email: string
  message: string
  honeypot?: string
}

interface ApiError {
  code: string
  message: string
  details?: unknown
}

function createErrorResponse(status: number, error: ApiError) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const honeypot = typeof body.honeypot === "string" ? body.honeypot.trim() : ""

    if (honeypot.length > 0) {
      return NextResponse.json({ success: true })
    }

    if (!name || name.length < 2 || name.length > 100) {
      return createErrorResponse(400, {
        code: "INVALID_NAME",
        message: "Navn må være mellom 2 og 100 tegn."
      })
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailPattern.test(email) || email.length > 200) {
      return createErrorResponse(400, {
        code: "INVALID_EMAIL",
        message: "Ugyldig e-postadresse."
      })
    }

    if (!message || message.length < 10 || message.length > 2000) {
      return createErrorResponse(400, {
        code: "INVALID_MESSAGE",
        message: "Meldingen må være mellom 10 og 2000 tegn."
      })
    }

    const forwardedFor = request.headers.get("x-forwarded-for") || ""
    const ip = forwardedFor.split(",")[0]?.trim() || "unknown"
    const identifier = `${ip}:${email.toLowerCase()}`

    const rate = await rateLimiter.limit(`contact:${identifier}`)
    if (!rate.success) {
      return createErrorResponse(429, {
        code: "RATE_LIMITED",
        message: "For mange forespørsler. Prøv igjen senere.",
        details: {
          limit: rate.limit,
          remaining: rate.remaining,
          reset: rate.reset
        }
      })
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      return createErrorResponse(500, {
        code: "EMAIL_NOT_CONFIGURED",
        message: "E-post er ikke riktig konfigurert."
      })
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.RESEND_FROM_EMAIL,
      reply_to: email,
      subject: `Kontaktforespørsel fra ${name}`,
      text: `Navn: ${name}
E-post: ${email}

Melding:
${message}`,
      html: `<p><strong>Navn:</strong> ${name}</p>
<p><strong>E-post:</strong> <a href="mailto:${email}">${email}</a></p>
<p><strong>Melding:</strong></p>
<p>${message.replace(/\n/g, "<br />")}</p>`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return createErrorResponse(500, {
      code: "CONTACT_FAILED",
      message: "Kunne ikke sende meldingen. Prøv igjen senere.",
      details: error instanceof Error ? error.message : "Ukjent feil"
    })
  }
}

