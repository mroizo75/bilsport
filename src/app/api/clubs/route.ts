import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const clubs = await db.club.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        shortName: true,
      }
    })

    return NextResponse.json(clubs)
  } catch (error) {
    return new NextResponse("Intern serverfeil", { status: 500 })
  }
} 