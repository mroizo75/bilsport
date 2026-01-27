import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"
import * as z from "zod"
import { rateLimiter } from "@/lib/rate-limit"

const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    // Rate limiting
    const identifier = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous"
    const { success } = await rateLimiter.limit(identifier)
    
    if (!success) {
      return new NextResponse("For mange forsøk. Prøv igjen senere.", { status: 429 })
    }

    const json = await req.json()
    const body = userSchema.parse(json)

    const exists = await db.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (exists) {
      return new NextResponse("E-post er allerede i bruk", { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 12)

    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    })

    const { password: _, ...result } = user
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Ugyldig input", { status: 422 })
    }

    return new NextResponse("Intern serverfeil", { status: 500 })
  }
} 