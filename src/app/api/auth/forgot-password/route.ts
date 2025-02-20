import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/mail"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
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

    // Lagre token i databasen
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Send e-post med reset-lenke
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