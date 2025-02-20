import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatPrice } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OrderDetailsProps {
  order: {
    orderId: string
    transactionId: string | null
    status: string
    totalAmount: number
    driverName: string
    customerEmail: string | null
    customerPhone: string | null
    validFrom: string
    validTo: string | null
    createdAt: string
    paymentMethod: string | null
    paymentStatus: string | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ordredetaljer - {order.orderId}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <h3 className="font-semibold">Ordre Informasjon</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Betalingsstatus:</span>
                  <span className="font-medium">{order.paymentStatus || 'Ikke betalt'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beløp:</span>
                  <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Betalingsmetode:</span>
                  <span className="font-medium">{order.paymentMethod || 'Ikke spesifisert'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaksjon ID:</span>
                  <span className="font-medium">{order.transactionId || 'Ikke tilgjengelig'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <h3 className="font-semibold">Kunde Informasjon</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Navn:</span>
                  <span className="font-medium">{order.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E-post:</span>
                  <span className="font-medium">{order.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefon:</span>
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <h3 className="font-semibold">Lisens Informasjon</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Race Dato:</span>
                  <span>{new Date(order.validFrom).toLocaleDateString('no-NO')}</span>
                </div>
                {order.validTo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gyldig til:</span>
                    <span className="font-medium">
                      {new Date(order.validTo).toLocaleDateString('no-NO')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Opprettet:</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('no-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 