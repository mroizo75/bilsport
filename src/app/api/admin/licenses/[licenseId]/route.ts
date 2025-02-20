import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { licenseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const { licenseId } = params

    await db.license.delete({
      where: {
        id: licenseId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return new NextResponse("Lisens ikke funnet", { status: 404 })
    }
    return new NextResponse("Intern serverfeil", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { licenseId: string } }
) {
  try {
    const { licenseId } = params

    const license = await db.license.findUnique({
      where: {
        id: licenseId
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