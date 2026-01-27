import { OpenAI } from "openai"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Enkelt system prompt
const SYSTEM_PROMPT = `Du er en hjelpsom lisensrådgiver for bilsport.

PRISER:
- Banedag: 220 kr
- Trening: 220 kr  
- Test: 220 kr
- Konkurranse: 350 kr
- Passasjer: 220 kr

VIKTIG: Når bruker vil bestille eller sier "ja takk", returner:
1. En kort tekst
2. Deretter JSON på egen linje: {"action":"order","category":"Banedag"}

Hold svar korte (1-2 setninger). Svar alltid på norsk.

Eksempler:
Bruker: "Hva koster banedag?"
Du: "Banedag koster 220 kr for én dag."

Bruker: "Jeg vil bestille"
Du: "Perfekt! Jeg hjelper deg med å bestille.
{"action":"order","category":"Banedag"}"

Bruker: "ja takk"
Du: "Flott! Her er lisensene:
{"action":"order","category":"Banedag"}"`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: "Mangler melding" },
        { status: 400 }
      )
    }

    // Kall OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    let responseMessage = completion.choices[0].message.content || "Beklager, jeg forstod ikke det."
    
    // Sjekk om svaret inneholder bestillingsinfo
    let orderData = null
    const jsonMatch = responseMessage.match(/\{[^}]*"action"\s*:\s*"order"[^}]*\}/)
    
    if (jsonMatch) {
      console.log('[CHAT] Found order JSON:', jsonMatch[0])
      try {
        orderData = JSON.parse(jsonMatch[0])
        
        // Hent lisenser fra database (MySQL er case-insensitive by default)
        const licenses = await prisma.license.findMany({
          where: {
            category: {
              contains: orderData.category
            }
          },
          take: 5,
          orderBy: { price: 'asc' }
        })

        console.log('[CHAT] Found licenses:', licenses.length)

        if (licenses.length > 0) {
          orderData.products = licenses.map(l => ({
            id: l.id,
            name: l.name,
            price: l.price.toString(),
            category: l.category
          }))
          
          // Fjern JSON fra meldingen for å vise ren tekst
          responseMessage = responseMessage.replace(jsonMatch[0], '').trim()
          
          console.log('[CHAT] Added products:', orderData.products.length)
        } else {
          console.warn('[CHAT] No licenses found for category:', orderData.category)
        }
      } catch (e) {
        console.error('[CHAT] Parse error:', e)
      }
    }

    console.log('[CHAT] Returning orderData:', orderData ? 'YES' : 'NO')

    return NextResponse.json({
      message: responseMessage,
      orderData
    })

  } catch (error: any) {
    console.error("[CHAT ERROR]", error?.message || error)
    
    // Gi bedre feilmelding
    if (error?.message?.includes('API key')) {
      return NextResponse.json(
        { error: "OpenAI API nøkkel mangler eller er ugyldig" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Teknisk feil. Prøv igjen." },
      { status: 500 }
    )
  }
}
