import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const licenses = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED"
      },
      select: {
        id: true,
        validFrom: true,
        validTo: true,
        license: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(licenses)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
} 