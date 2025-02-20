import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    // Finn den innloggede admin-brukeren
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        // legg til flere felter om du vil
      },
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Ikke funnet" }),
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[ADMIN_PROFILE_GET]", error)
    return new NextResponse(
      JSON.stringify({ error: "En feil oppstod ved henting av admin-profil" }),
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    const { name, email, phone } = await request.json()
    // Sjekk for gyldige data om nødvendig, f.eks. om name eller email er tom, etc.

    // Oppdater brukeren i databasen
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("[ADMIN_PROFILE_PUT]", error)
    return new NextResponse(
      JSON.stringify({ error: "En feil oppstod ved oppdatering av admin-profil" }),
      { status: 500 }
    )
  }
} 