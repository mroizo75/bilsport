import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Hent alle kategorier
export async function GET() {
  try {
    const categories = await prisma.licenseCategory.findMany({
      include: {
        subTypes: true
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke hente kategorier" },
      { status: 500 }
    )
  }
}

// Opprett ny kategori
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { name, description } = await req.json()
    
    const category = await prisma.licenseCategory.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke opprette kategori" },
      { status: 500 }
    )
  }
} 