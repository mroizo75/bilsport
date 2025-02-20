import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    const updatedOrder = await prisma.order.update({
      where: {
        id: params.orderId
      },
      data: {
        status
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("[ORDER_UPDATE]", error)
    return new NextResponse(
      JSON.stringify({ error: "Kunne ikke oppdatere ordre" }),
      { status: 500 }
    )
  }
} 