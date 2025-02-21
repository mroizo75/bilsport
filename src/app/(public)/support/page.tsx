"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserCircle, Bot } from "lucide-react"
import { Shell } from "@/components/shell"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) throw new Error("Feil ved sending av melding")

      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Beklager, jeg kunne ikke prosessere forespørselen din. Prøv igjen senere." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Shell>
      <div className="container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Support</h1>
        
        <Card className="mb-4 sm:mb-6 p-4 sm:p-6">
          <p className="text-muted-foreground">
            Lurer du på hvilken lisens du trenger? Chat med vår AI-assistent som kan 
            hjelpe deg å finne riktig lisens basert på dine behov.
          </p>
        </Card>

        <div className="border rounded-lg h-[calc(100vh-20rem)] sm:h-[600px] flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 px-4">
                Start en samtale ved å stille et spørsmål om lisenser
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 ${
                      message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {message.role === "assistant" ? (
                        <Bot className="h-6 w-6 sm:h-8 sm:w-8" />
                      ) : (
                        <UserCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      } text-sm sm:text-base`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t">
            <div className="flex gap-2 items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Skriv din melding her..."
                disabled={isLoading}
                className="text-sm sm:text-base"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="whitespace-nowrap"
              >
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  )
} 