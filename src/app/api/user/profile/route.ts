import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import * as z from "zod"
import bcrypt from "bcrypt"

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(8).max(15).optional(),
})

const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
})

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, phone } = updateProfileSchema.parse(body)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        name,
        phone: phone || null
      }
    })

    return new NextResponse("Profile updated")
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = updatePasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.password) {
      return new NextResponse("No password set", { status: 400 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return new NextResponse("Invalid password", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return new NextResponse("Password updated")
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 })
  }
} 