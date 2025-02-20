"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

interface CartItemProps {
  item: {
    id: string
    name: string
    price: number
    category: string
    subType: string
    driverName?: string
    startDate?: string
    endDate?: string
  }
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem } = useCart()

  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-4">
        <div className="flex flex-1 gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <h3 className="line-clamp-1 font-medium">{item.name}</h3>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span>{item.category} - {item.subType}</span>
              {item.driverName && <span>Fører: {item.driverName}</span>}
              {item.startDate && (
                <span>
                  Gyldig: {new Date(item.startDate).toLocaleDateString()} 
                  {item.endDate && ` - ${new Date(item.endDate).toLocaleDateString()}`}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-1 font-medium">
            <span>{formatPrice(item.price)}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => removeItem(item.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fjern fra handlekurv</span>
        </Button>
      </div>
    </div>
  )
} 