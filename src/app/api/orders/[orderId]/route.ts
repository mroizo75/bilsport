import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { 
        orderId: orderId 
      },
      include: {
        license: true,
        club: true
      }
    })

    if (!order) {
      return new NextResponse(
        JSON.stringify({ error: "Ordre ikke funnet" }),
        { status: 404 }
      )
    }

    // Sjekk at brukeren eier ordren
    if (order.userId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 403 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return new NextResponse(
      JSON.stringify({ error: "Kunne ikke hente ordre" }),
      { status: 500 }
    )
  }
} 