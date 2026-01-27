"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserCircle, Bot, ShoppingCart } from "lucide-react"
import { Shell } from "@/components/shell"

interface Product {
  id: string
  name: string
  price: string
  category: string
}

interface OrderData {
  action: string
  category: string
  subType?: string
  price: number
  products?: Product[]
}

interface Message {
  role: "user" | "assistant"
  content: string
  orderData?: OrderData
}

export default function SupportPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll ned når meldinger endres (bruker setTimeout for å sikre DOM er oppdatert)
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (viewport) {
          // Bruk smooth scroll til bunnen uten å påvirke parent
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          })
        }
      }
    }

    // Liten delay for å sikre at DOM er ferdig rendret
    const timer = setTimeout(scrollToBottom, 100)
    
    // Sett fokus tilbake på input etter at AI svarer
    if (!isLoading) {
      inputRef.current?.focus()
    }

    return () => clearTimeout(timer)
  }, [messages, isLoading])

  // Sett fokus på input når siden lastes
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Ukjent feil" }))
        throw new Error(errorData.error || "API feil")
      }

      const data = await response.json()
      
      console.log('[FRONTEND] Received data:', {
        message: data.message,
        hasOrderData: !!data.orderData,
        productsCount: data.orderData?.products?.length || 0
      })
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.message || "Ingen svar fra AI",
        orderData: data.orderData 
      }])
    } catch (error: any) {
      console.error("Chat error:", error)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Feil: ${error.message || "Kunne ikke kontakte serveren"}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Shell>
      <div className="container max-w-3xl mx-auto p-4 sm:p-6">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Lisensrådgiver</h1>
          <p className="text-sm text-muted-foreground">
            Spør meg om hvilken lisens du trenger 👇
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <div className="flex flex-col h-[500px] sm:h-[550px]">
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    Hei! Jeg hjelper deg med å finne riktig bilsportlisens.
                    <br />
                    Start med å fortelle meg hva du skal gjøre.
                  </p>
                </div>
              )}
              
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 sm:gap-3 ${
                    message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {message.role === "assistant" ? (
                      <div className="bg-primary/10 rounded-full p-1.5">
                        <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                    ) : (
                      <div className="bg-primary rounded-full p-1.5">
                        <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 max-w-[75%] sm:max-w-[80%]">
                    <div
                      className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 ${
                        message.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      } text-sm sm:text-base leading-relaxed`}
                    >
                      {message.content.replace(/\{[^}]*"action"\s*:\s*"order"[^}]*\}/g, '').trim()}
                    </div>
                      
                    {/* Vis bestillingsknapper hvis orderData finnes */}
                    {message.orderData?.products && message.orderData.products.length > 0 ? (
                      <Card className="p-3 bg-primary/5 border-primary/20">
                        <p className="text-xs sm:text-sm font-medium mb-2">📦 Tilgjengelige lisenser:</p>
                        <div className="space-y-1.5">
                          {message.orderData.products.map((product) => (
                            <Button
                              key={product.id}
                              variant="outline"
                              size="sm"
                              className="w-full justify-between h-auto py-2 text-left hover:bg-primary/10"
                              onClick={() => router.push(`/products?category=${product.category}`)}
                            >
                              <span className="text-xs sm:text-sm font-medium">{product.name}</span>
                              <span className="flex items-center gap-1 text-xs sm:text-sm font-bold">
                                {product.price} kr
                                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                              </span>
                            </Button>
                          ))}
                        </div>
                        <Button
                          className="w-full mt-2"
                          size="sm"
                          onClick={() => router.push('/products')}
                        >
                          Se alle lisenser
                        </Button>
                      </Card>
                    ) : message.orderData ? (
                      <Card className="p-3 bg-yellow-50 border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          ⚠️ Ingen produkter funnet. OrderData finnes men ingen produkter.
                        </p>
                      </Card>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t bg-muted/30">
            <div className="flex gap-2 items-center">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Skriv melding..."
                disabled={isLoading}
                className="text-sm sm:text-base"
                autoComplete="off"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="whitespace-nowrap px-4 sm:px-6"
                size="default"
              >
                {isLoading ? "..." : "Send"}
              </Button>
            </div>
          </form>
          </div>
        </Card>
      </div>
    </Shell>
  )
} 