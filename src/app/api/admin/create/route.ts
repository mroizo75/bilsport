import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"
import * as z from "zod"

const adminSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  adminKey: z.string()
})

// Dette burde være en miljøvariabel i produksjon
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY!

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = adminSchema.parse(json)

    if (body.adminKey !== ADMIN_SECRET_KEY) {
      return new NextResponse("Ugyldig admin-nøkkel", { status: 401 })
    }

    const exists = await db.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (exists) {
      return new NextResponse("E-post er allerede i bruk", { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: "ADMIN",
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