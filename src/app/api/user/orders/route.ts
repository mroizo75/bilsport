import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: status || undefined
      },
      include: {
        license: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders.map(order => ({
      ...order,
      validFrom: order.validFrom.toISOString(),
      validTo: order.validTo?.toISOString() || null
    })))
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse('Error', { status: 500 })
  }
} 