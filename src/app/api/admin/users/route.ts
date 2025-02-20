import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcrypt"
import { generatePassword } from "@/lib/utils"
import { sendWelcomeEmail } from "@/lib/postmark"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const users = await prisma.user.findMany({
      include: {
        orders: {
          include: {
            license: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return new NextResponse(
      JSON.stringify(users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        createdAt: user.createdAt,
        orders: user.orders.map(order => ({
          id: order.id,
          orderId: order.orderId,
          status: order.status,
          totalAmount: order.totalAmount,
          driverName: order.driverName,
          licenseName: order.license.name,
          createdAt: order.createdAt,
          paymentStatus: order.paymentStatus
        }))
      }))),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Kunne ikke hente brukere" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, role } = body

    // Sjekk om bruker allerede eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: "Bruker med denne e-postadressen eksisterer allerede" }),
        { status: 400 }
      )
    }

    // Generer sikkert passord
    const password = generatePassword()
    const hashedPassword = await bcrypt.hash(password, 12)

    // Opprett bruker
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      }
    })

    // Send velkomst-e-post med innloggingsinformasjon
    await sendWelcomeEmail({
      to: email,
      name,
      password,
    })

    return NextResponse.json({ 
      message: "Bruker opprettet",
      userId: user.id 
    })

  } catch (error) {
    console.error("[USERS_POST]", error)
    return new NextResponse(
      JSON.stringify({ error: "Kunne ikke opprette bruker" }),
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Ikke autorisert" }),
        { status: 401 }
      )
    }

    const { userId } = await request.json()
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Ingen userId oppgitt" }),
        { status: 400 }
      )
    }

    // Sletter brukeren i databasen
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({
      message: "Bruker slettet"
    })
  } catch (error) {
    console.error("[USERS_DELETE]", error)
    return new NextResponse(
      JSON.stringify({ error: "Kunne ikke slette bruker" }),
      { status: 500 }
    )
  }
} 