"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CartItem } from "./cart-item"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

export function CartSheet() {
  const { items, total } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>Handlekurv</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {items.length > 0 ? (
            <>
              <div className="flex flex-1 flex-col gap-4 overflow-auto">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
              <div className="grid gap-4 px-1">
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/checkout">
                    Gå til betaling
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-2">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <span className="text-lg font-medium">Handlekurven er tom</span>
              <Button asChild variant="link" className="text-sm text-muted-foreground">
                <Link href="/">
                  Fortsett å handle
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 