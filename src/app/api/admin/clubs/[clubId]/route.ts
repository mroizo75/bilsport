import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  request: Request,
  context: { params: Promise<{ clubId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { clubId } = await context.params

    await prisma.club.delete({
      where: { id: clubId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    
    const session = await getServerSession(authOptions)
    if (!session) {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      return NextResponse.redirect(`${baseUrl}/login`)
    }
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    const club = await prisma.club.findUnique({
      where: {
        id: clubId
      }
    })

    if (!club) {
      return new NextResponse(
        JSON.stringify({ error: "Klubb ikke funnet" }),
        { status: 404 }
      )
    }

    return NextResponse.json(club)
  } catch (error) {
    console.error("[CLUB_GET]", error)
    return new NextResponse(
      JSON.stringify({ error: "Kunne ikke hente klubb" }),
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    const body = await request.json()

    const updatedClub = await prisma.club.update({
      where: {
        id: clubId
      },
      data: {
        name: body.name,
        shortName: body.shortName,
        email: body.email,
        phone: body.phone,
      }
    })

    return NextResponse.json(updatedClub)
  } catch (error) {
    console.error("[CLUB_PATCH]", error)
    return new NextResponse(
      JSON.stringify({ error: "Kunne ikke oppdatere klubb" }),
      { status: 500 }
    )
  }
} 