import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const paymentId = searchParams.get('paymentid')

    if (!paymentId) {
      return NextResponse.json(
        { message: "Mangler payment ID" },
        { status: 400 }
      )
    }

    // Finn ordren med denne payment ID
    const order = await prisma.order.findFirst({
      where: { transactionId: paymentId }
    })

    if (!order) {
      return NextResponse.json(
        { message: "Ordre ikke funnet" },
        { status: 404 }
      )
    }

    // Oppdater ordren som betalt (siden vi er på success-siden fra Nexi)
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        paymentStatus: 'COMPLETED',
        paymentMethod: 'card'
      }
    })

    return NextResponse.json({
      status: 'success',
      orderId: updatedOrder.orderId
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { message: "Kunne ikke verifisere betaling" },
      { status: 500 }
    )
  }
} 