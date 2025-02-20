import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const licenses = await db.license.findMany({
      where: type ? {
        category: type
      } : undefined,
      select: {
        id: true,
        category: true,
        subType: true,
        name: true,
        description: true,
        price: true,
      },
      orderBy: {
        category: 'asc'
      }
    })

    return NextResponse.json(licenses)
  } catch (error) {
    return new NextResponse("Intern serverfeil", { status: 500 })
  }
} 