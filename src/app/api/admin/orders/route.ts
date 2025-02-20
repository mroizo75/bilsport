import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        license: true,
        club: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    }).catch((error) => {
      console.error("Database error:", error)
      throw new Error("Database error")
    })

    if (!orders) {
      return new NextResponse(
        JSON.stringify({ error: "Kunne ikke hente ordrer" }),
        { status: 500 }
      )
    }

    return NextResponse.json({
      orders: orders.map(order => ({
        id: order.id,
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        driverName: order.driverName,
        vehicleReg: order.vehicleReg || '',
        validFrom: order.validFrom,
        validTo: order.validTo,
        createdAt: order.createdAt,
        customerName: order.user?.name,
        customerEmail: order.user?.email,
        licenseName: order.license.name,
        clubName: order.club.name
      }))
    })

  } catch (error) {
    console.error("[ADMIN_ORDERS_GET]", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "En feil oppstod ved henting av ordrer",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }),
      { status: 500 }
    )
  }
} 