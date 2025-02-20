"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import useSWR, { mutate } from "swr"

interface Club {
  id: string
  name: string
  shortName: string
  email: string
  phone: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ClubTable() {
  const { toast } = useToast()
  const { data: clubs, error, isLoading } = useSWR<Club[]>('/api/admin/clubs', fetcher)

  async function deleteClub(id: string) {
    try {
      const response = await fetch(`/api/admin/clubs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error()

      // Revalidate data
      mutate('/api/admin/clubs')
      
      toast({
        title: "Klubb slettet",
        description: "Klubben ble slettet",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke slette klubben",
      })
    }
  }

  if (error) {
    return <div>Feil ved lasting av klubber</div>
  }

  if (isLoading) {
    return <div>Laster...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Navn</TableHead>
            <TableHead>Forkortelse</TableHead>
            <TableHead>E-post</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clubs?.map((club) => (
            <TableRow key={club.id}>
              <TableCell>{club.name}</TableCell>
              <TableCell>{club.shortName}</TableCell>
              <TableCell>{club.email}</TableCell>
              <TableCell>{club.phone}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => window.location.href = `/admin/clubs/edit/${club.id}`}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Rediger
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteClub(club.id)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Slett
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 