import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as z from "zod"

const licenseSchema = z.object({
  category: z.string().min(1, "Velg hovedkategori"),
  subType: z.string().min(1, "Velg underkategori"),
  name: z.string().min(2, "Skriv inn lisensnavn"),
  description: z.string().min(10, "Legg til en beskrivelse"),
  price: z.string().regex(/^\d+$/, "Må være et tall"),
  duration: z.string().min(1, "Velg varighet"),
  requirements: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const body = licenseSchema.parse(json)

    const license = await db.license.create({
      data: {
        category: body.category,
        subType: body.subType,
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        validFrom: new Date(),
        validTo: body.duration ? new Date(Date.now() + parseInt(body.duration) * 24 * 60 * 60 * 1000) : null,
      }
    })

    return NextResponse.json(license)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({
        errors: error.errors,
        message: "Ugyldig input"
      }), { 
        status: 422,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new NextResponse("Intern serverfeil", { status: 500 })
  }
}

export async function GET() {
  try {
    const licenses = await db.license.findMany({
      orderBy: {
        category: 'asc'
      }
    })

    return NextResponse.json(licenses)
  } catch (error) {
    return new NextResponse("Intern serverfeil", { status: 500 })
  }
} 