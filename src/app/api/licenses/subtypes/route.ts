import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Hent alle underkategorier
export async function GET() {
  try {
    const subTypes = await prisma.licenseSubType.findMany({
      include: {
        category: true
      }
    })
    return NextResponse.json(subTypes)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke hente underkategorier" },
      { status: 500 }
    )
  }
}

// Opprett ny underkategori
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Ikke autorisert" },
        { status: 401 }
      )
    }

    const { categoryId, name, description, price } = await req.json()
    
    const subType = await prisma.licenseSubType.create({
      data: {
        name,
        description,
        price,
        categoryId
      }
    })

    return NextResponse.json(subType)
  } catch (error) {
    return NextResponse.json(
      { error: "Kunne ikke opprette underkategori" },
      { status: 500 }
    )
  }
} 