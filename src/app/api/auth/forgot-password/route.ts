import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/mail"
import crypto from "crypto"
import { rateLimiter } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    // Rate limiting for å forhindre email bombing
    const identifier = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous"
    const { success } = await rateLimiter.limit(identifier)
    
    if (!success) {
      return new NextResponse("For mange forsøk. Prøv igjen senere.", { status: 429 })
    }

    const { email } = await req.json()

    // Finn bruker
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Returner 200 selv om bruker ikke finnes (sikkerhet)
      return new NextResponse("Password reset email sent if account exists")
    }

    // Generer token med 1 times gyldighet
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 time

    // Hash token før lagring i database (sikkerhet)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Lagre hashet token i databasen
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry
      }
    })

    // Send e-post med unhashed token (kun mottaker har tilgang)
    await sendPasswordResetEmail(
      user.email,
      `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    )

    return new NextResponse("Password reset email sent if account exists")
  } catch (error) {
    console.error('Error in forgot-password:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 