import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { licenseId: string } }
) {
  try {
    const license = await db.license.findUnique({
      where: {
        id: params.licenseId
      },
      select: {
        id: true,
        category: true,
        subType: true,
        name: true,
        description: true,
        price: true,
      }
    })

    if (!license) {
      return new NextResponse("Lisens ikke funnet", { status: 404 })
    }

    return NextResponse.json(license)
  } catch (error) {
    return new NextResponse("Intern serverfeil", { status: 500 })
  }
} 