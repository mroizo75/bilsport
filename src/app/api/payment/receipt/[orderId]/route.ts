import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateLicensePDF } from "@/lib/pdf-generator"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Hent ordre med alle relasjoner
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        license: true,
        club: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Ordre ikke funnet" },
        { status: 404 }
      )
    }

    // Hent totalt antall ordrer for samme paymentId
    const allOrders = await prisma.order.findMany({
      where: { vippsOrderId: order.vippsOrderId },
      orderBy: { createdAt: 'asc' },
    })

    const orderIndex = allOrders.findIndex(o => o.id === orderId)

    // Generer PDF
    const pdfBuffer = await generateLicensePDF({
      orderId: order.orderId,
      orderNumber: orderIndex + 1,
      totalOrders: allOrders.length,
      driverName: order.driverName,
      vehicleReg: order.vehicleReg || '',
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      totalAmount: Number(order.totalAmount),
      validFrom: order.validFrom.toISOString(),
      license: {
        name: order.license.name,
        category: order.license.category,
      },
      club: {
        name: order.club.name,
      },
    })

    // Returner PDF som response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="lisens_${orderIndex + 1}_${order.driverName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[RECEIPT API] Error:', error)
    return NextResponse.json(
      { error: "Kunne ikke generere kvittering" },
      { status: 500 }
    )
  }
}
