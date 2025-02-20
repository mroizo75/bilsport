import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as z from "zod"
import { prisma } from "@/lib/prisma"

const orderSchema = z.object({
  clubId: z.string(),
  licenseType: z.string(),
  driverName: z.string(),
  vehicleReg: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = orderSchema.parse(json)

    // Finn lisensen basert på type
    const license = await db.license.findFirst({
      where: {
        category: body.licenseType
      }
    })

    if (!license) {
      return new NextResponse("Lisens ikke funnet", { status: 404 })
    }

    // Opprett ordre
    const order = await db.order.create({
      data: {
        orderId: `ORDER-${Date.now()}`,
        licenseId: license.id,
        userId: session.user.id,
        clubId: body.clubId,
        status: "PENDING",
        totalAmount: license.price,
        driverName: body.driverName,
        vehicleReg: body.vehicleReg || null,
        validFrom: new Date(body.startDate),
        validTo: body.endDate ? new Date(body.endDate) : null,
        orderDate: new Date(),
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Ugyldig input", { status: 422 })
    }

    return new NextResponse("Intern serverfeil", { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status: status }),
      },
      include: {
        license: true,
        club: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      orders: orders.map(order => ({
        orderId: order.orderId,
        licenseName: order.license.name,
        status: order.status,
        totalAmount: order.totalAmount,
        validFrom: order.validFrom,
        validTo: order.validTo,
        clubName: order.club.name,
        driverName: order.driverName,
        vehicleReg: order.vehicleReg || '',
      }))
    })

  } catch (error) {
    console.error("[ORDERS_GET]", error)
    return new NextResponse(
      JSON.stringify({ error: "Kunne ikke hente ordrer" }),
      { status: 500 }
    )
  }
} 