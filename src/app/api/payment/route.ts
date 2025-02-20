import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateOrderNumber } from "@/lib/utils"

const SECRET_KEY = process.env.NEXI_SECRET_TEST_KEY!
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    console.log("1. Request body:", JSON.stringify(body, null, 2))

    // Generer ordrenummer
    const orderNumber = await generateOrderNumber()
    
    // Opprett ordre for hver lisens
    const orders = await Promise.all(body.licenses.map(async (license: any, index: number) => {
      console.log("Creating order with license data:", license)

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

      console.log("Order data being created:", orderData)
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
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "Kunne ikke prosessere betaling", details: error instanceof Error ? error.message : "Ukjent feil" },
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
    console.log("1. Verifiserer betaling med ID:", paymentId)

    const checkoutResponse = await fetch(`https://test.api.dibspayment.eu/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!checkoutResponse.ok) {
      console.error("Nexi API Error:", await checkoutResponse.text())
      throw new Error("Kunne ikke hente betalingsstatus")
    }

    const paymentData = await checkoutResponse.json()
    console.log("2. Betalingsdata fra Nexi:", JSON.stringify(paymentData, null, 2))
    
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

    console.log("3. Betalingsstatus:", {
      hasCharges: !!paymentData.payment.charges,
      chargeAmount: paymentData.payment.charges?.[0]?.amount,
      orderAmount: paymentData.payment.orderDetails?.amount,
      isCompleted
    })

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

    console.log("4. Oppdatert ordrestatus til:", isCompleted ? "COMPLETED" : "FAILED")

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
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { error: "Kunne ikke verifisere betalingen", details: error instanceof Error ? error.message : "Ukjent feil" },
      { status: 500 }
    )
  }
}