import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        Order: {
          where: {
            status: "COMPLETED",  // Bare tell fullførte ordrer
          },
          select: {
            id: true,
            validFrom: true,  // Bruk validFrom istedenfor date
          },
          distinct: ['validFrom'], // Unngå duplikater på samme dato
        }
      }
    })

    // Omform dataene til ønsket format
    const formattedClubs = clubs.map(club => ({
      id: club.id,
      name: club.name,
      activities: club.Order.map(order => ({
        id: order.id,
        date: order.validFrom,  // Bruk validFrom som dato
        registeredCount: 0,  // Vi vil oppdatere dette under
        maxParticipants: null,
        clubId: club.id,
        clubName: club.name
      }))
    }))

    // For hver klubb og dato, tell antall lisenser
    for (const club of formattedClubs) {
      for (const activity of club.activities) {
        const count = await prisma.order.count({
          where: {
            clubId: club.id,
            validFrom: activity.date,
            status: "COMPLETED"
          }
        })
        activity.registeredCount = count
      }
    }

    return NextResponse.json(formattedClubs)
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json({ error: "Could not fetch clubs" }, { status: 500 })
  }
} 