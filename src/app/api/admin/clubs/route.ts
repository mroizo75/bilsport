import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as z from "zod"

const clubSchema = z.object({
  name: z.string().min(2),
  shortName: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^\d{8}$/).optional().or(z.literal('')),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("POST /api/admin/clubs - Session:", session)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    console.log("POST /api/admin/clubs - Request body:", json)

    const body = clubSchema.parse(json)
    console.log("POST /api/admin/clubs - Parsed body:", body)

    const club = await db.club.create({
      data: {
        name: body.name,
        shortName: body.shortName,
        email: body.email || null,
        phone: body.phone || null,
      },
    })
    console.log("POST /api/admin/clubs - Created club:", club)

    return NextResponse.json(club)
  } catch (error) {
    console.error("POST /api/admin/clubs - Error:", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Ugyldig input", { status: 422 })
    }

    return new NextResponse("Intern serverfeil", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const clubs = await db.club.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(clubs)
  } catch (error) {
    return new NextResponse("Intern serverfeil", { status: 500 })
  }
} 