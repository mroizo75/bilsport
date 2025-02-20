"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import useSWR from "swr"

interface User {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  orders: Array<{
    id: string
    orderId: string
    status: string
    totalAmount: number
    driverName: string
    licenseName: string
    createdAt: string
    paymentStatus: string
  }>
}

// En enkel fetcher-funksjon for SWR
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch data")
  return res.json()
})

export default function UsersPage() {
  // Bruk SWR for å hente brukere
  const { data: users, error, isLoading, mutate } = useSWR<User[]>("/api/admin/users", fetcher)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const UserOrdersDialog = ({ user }: { user: User | null }) => {
    if (!user) return null

    const completedOrders = user.orders.filter(order => order.status === "COMPLETED")
    const totalSpent = completedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)

    return (
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Brukerdetaljer - {user.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <h3 className="font-semibold">Brukerinformasjon</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Navn:</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E-post:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefon:</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medlem siden:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('no-NO')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total brukt:</span>
                  <span className="font-medium">{formatPrice(totalSpent)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Ordrehistorikk</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordre ID</TableHead>
                    <TableHead>Lisens</TableHead>
                    <TableHead>Beløp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.licenseName}</TableCell>
                      <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString('no-NO')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    )
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Er du sikker på at du vil slette denne brukeren?")) return
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      if (!res.ok) throw new Error("Sletting feilet.")
      // La SWR oppdatere
      mutate()
    } catch (error) {
      console.error("handleDeleteUser:", error)
    }
  }

  if (isLoading) return <div>Laster...</div>
  if (error) return <div>Kunne ikke hente brukere</div>

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Brukere</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          Legg til ny bruker
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Antall Ordrer</TableHead>
              <TableHead>Medlem siden</TableHead>
              <TableHead>Handling</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.orders.length}</TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('no-NO')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedUser(user)
                            setDialogOpen(true)
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Rediger</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Slett</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <UserOrdersDialog user={selectedUser} />
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <AddUserDialogContent
          onSuccess={() => {
            // Bare be SWR om ny data
            mutate()
            setAddDialogOpen(false)
          }}
          onCancel={() => setAddDialogOpen(false)}
        />
      </Dialog>
    </div>
  )
}

function AddUserDialogContent({ onSuccess, onCancel }: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({ name: "", email: "", role: "USER" })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (!response.ok) {
        throw new Error("Kunne ikke opprette bruker")
      }
      toast({
        title: "Bruker opprettet",
        description: "En e-post med innloggingsinformasjon er sendt til brukeren",
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke opprette bruker",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Legg til ny bruker</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleAddUser} className="space-y-4">
        <div className="space-y-2">
          <Label>Navn</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>E-post</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Rolle</Label>
          <select
            className="border rounded-md p-2 text-sm w-full"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "USER" | "ADMIN" })}
          >
            <option value="USER">Bruker</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Avbryt
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Opprett bruker
          </Button>
        </div>
      </form>
    </DialogContent>
  )
} 