import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateOrderNumber } from "@/lib/utils"
import { rateLimiter } from "@/lib/rate-limit"
import * as z from "zod"
import { generateLicensePDF } from "@/lib/pdf-generator"
import { sendLicenseReceipt } from "@/lib/postmark"

const SECRET_KEY = process.env.NEXI_SECRET_TEST_KEY!
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL!

// Zod validering for payment request
const paymentSchema = z.object({
  licenses: z.array(z.object({
    licenseId: z.string().min(1),
    price: z.number().positive(),
    driverName: z.string().min(2),
    vehicleReg: z.string().optional(),
    clubId: z.string().min(1),
    startDate: z.string(),
    endDate: z.string().optional(),
    category: z.string().min(1),
    name: z.string().min(1),
    subType: z.string().min(1),
  })).min(1),
  amount: z.number().positive(),
  customerInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(8),
  })
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Rate limiting for betalinger
    const identifier = session.user.email || "anonymous"
    const { success } = await rateLimiter.limit(identifier)
    
    if (!success) {
      return new NextResponse("For mange forsøk. Prøv igjen senere.", { status: 429 })
    }

    const json = await req.json()
    
    // Valider input med Zod
    const body = paymentSchema.parse(json)

    // Generer ordrenummer
    const orderNumber = await generateOrderNumber()
    
    // Opprett ordre for hver lisens
    const orders = await Promise.all(body.licenses.map(async (license, index: number) => {

      // Først opprett lisensen
      const createdLicense = await prisma.license.create({
        data: {
          subTypeId: license.licenseId,
          validFrom: new Date(license.startDate),
          validTo: license.endDate ? new Date(license.endDate) : null,
          price: new Decimal(license.price),
          category: license.category,
          name: license.name,
          description: license.subType,
        }
      })

      // Så opprett ordren med den nyopprettede lisensens ID
      const orderData = {
        orderId: `${orderNumber}-${index + 1}`,
        userId: session.user.id,
        status: "PENDING",
        totalAmount: new Decimal(license.price),
        customerEmail: session.user.email!,
        customerPhone: body.customerInfo.phone || "",
        driverName: license.driverName,
        vehicleReg: license.vehicleReg,
        licenseId: createdLicense.id, // Bruk ID-en fra den nyopprettede lisensen
        clubId: license.clubId,
        validFrom: new Date(license.startDate),
        validTo: license.endDate ? new Date(license.endDate) : null,
        orderDate: new Date(),
      }

      return await prisma.order.create({ data: orderData })
    }))

    // Nexi betalingsforespørsel med flere items
    const response = await fetch("https://test.api.dibspayment.eu/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": SECRET_KEY
      },
      body: JSON.stringify({
        order: {
          items: body.licenses.map((license: any, index: number) => ({
            reference: `${orderNumber}-${index + 1}`,
            name: `${license.category} - ${license.name}`,
            quantity: 1,
            unit: "stk",
            unitPrice: license.price * 100,
            grossTotalAmount: license.price * 100,
            netTotalAmount: license.price * 100,
            description: `Ordrenr: ${orderNumber}-${index + 1}
Fører: ${license.driverName}
Dato: ${new Date(license.startDate).toLocaleDateString()}
${license.vehicleReg ? `Reg.nr: ${license.vehicleReg}` : ''}`
          })),
          amount: body.amount * 100,
          currency: "NOK",
          reference: orderNumber
        },
        checkout: {
          returnUrl: `${BASE_URL}/payment/complete?paymentId={checkoutPaymentId}`,
          cancelUrl: `${BASE_URL}/checkout`,
          integrationType: "HostedPaymentPage",
          merchantHandlesConsumerData: true,
          termsUrl: `${BASE_URL}/terms`,
          charge: true,
          appearance: {
            displayOptions: {
              showOrderSummary: true
            }
          }
        },
        consumer: {
          email: session.user.email,
          phoneNumber: body.customerInfo.phone,
          privatePerson: {
            firstName: body.customerInfo.firstName,
            lastName: body.customerInfo.lastName
          }
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Nexi API Error:", errorText)
      throw new Error(`Nexi API Error: ${errorText}`)
    }

    const data = await response.json()

    // Oppdater ordre med Nexi transactionId
    await Promise.all(orders.map(async (order, index) => {
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          transactionId: `${data.paymentId}-${index + 1}`
        }
      })
    }))

    return NextResponse.json({
      checkoutUrl: data.hostedPaymentPageUrl,
      orderId: orderNumber
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig betalingsinformasjon", details: error.errors },
        { status: 422 }
      )
    }
    
    console.error("Payment error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json(
      { error: "Kunne ikke prosessere betaling" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get('paymentId')
  
  if (!paymentId) {
    return NextResponse.json({ error: "Mangler paymentId" }, { status: 400 })
  }

  try {
    const checkoutResponse = await fetch(`https://test.api.dibspayment.eu/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!checkoutResponse.ok) {
      console.error("Nexi API Error: Failed to fetch payment status")
      throw new Error("Kunne ikke hente betalingsstatus")
    }

    const paymentData = await checkoutResponse.json()
    
    // Oppdater søket for å finne alle ordrer som starter med paymentId
    const orders = await prisma.order.findMany({
      where: {
        transactionId: {
          startsWith: paymentId
        }
      }
    })

    if (orders.length === 0) {
      throw new Error("Fant ikke ordrer")
    }

    // Sjekk om betalingen er fullført basert på charges
    const isCompleted = paymentData.payment.charges && 
                       paymentData.payment.charges.length > 0 && 
                       paymentData.payment.charges[0].amount === paymentData.payment.orderDetails.amount

    // Sjekk om dette er første gang ordren blir fullført
    const wasAlreadyCompleted = orders.every(order => order.status === "COMPLETED")

    // Oppdater hver ordre med en unik transactionId
    await Promise.all(orders.map(async (order) => {
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: isCompleted ? "COMPLETED" : "FAILED",
          paymentStatus: isCompleted ? "COMPLETED" : "FAILED",
          paymentMethod: paymentData.payment.paymentDetails?.paymentMethod || null
        }
      })
    }))

    // Send e-post med PDF-kvitteringer KUN første gang betaling fullføres
    if (isCompleted && orders.length > 0 && !wasAlreadyCompleted) {
      try {
        // Hent full ordre-info med relasjoner
        const fullOrders = await prisma.order.findMany({
          where: {
            id: { in: orders.map(o => o.id) }
          },
          include: {
            license: true,
            club: true,
            user: true
          }
        })

        // Generer PDF for hver lisens
        const pdfAttachments = await Promise.all(
          fullOrders.map(async (order, index) => {
            const pdfBuffer = await generateLicensePDF({
              orderId: order.orderId,
              orderNumber: index + 1,
              totalOrders: fullOrders.length,
              driverName: order.driverName,
              vehicleReg: order.vehicleReg || '',
              customerEmail: order.customerEmail || '',
              customerPhone: order.customerPhone || '',
              totalAmount: Number(order.totalAmount),
              validFrom: order.validFrom.toISOString(),
              license: {
                name: order.license.name,
                category: order.license.category
              },
              club: {
                name: order.club.name
              }
            })

            const driverName = order.driverName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            const licenseName = order.license.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            
            return {
              filename: `lisens_${index + 1}_${driverName}_${licenseName}.pdf`,
              content: pdfBuffer.toString('base64')
            }
          })
        )

        // Send e-post med alle PDFer
        const firstOrder = fullOrders[0]
        await sendLicenseReceipt({
          to: firstOrder.customerEmail || firstOrder.user.email || '',
          customerName: firstOrder.driverName,
          orderId: firstOrder.orderId.split('-')[1], // Kort ID
          licenseCount: fullOrders.length,
          pdfAttachments
        })

        console.log(`[EMAIL] Sent ${fullOrders.length} license PDFs to ${firstOrder.customerEmail}`)
      } catch (emailError) {
        console.error('[EMAIL] Failed to send receipt email:', emailError)
        // Ikke kast feil her - betalingen er godkjent uansett
      }
    }

    return NextResponse.json({ 
      status: paymentData.payment.status,
      orderIds: orders.map(order => order.orderId),
      debug: {
        paymentStatus: paymentData.payment.status,
        summaryStatus: paymentData.payment?.summary?.status,
        isCompleted
      }
    })
  } catch (error) {
    console.error("Payment verification error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json(
      { error: "Kunne ikke verifisere betalingen" },
      { status: 500 }
    )
  }
}