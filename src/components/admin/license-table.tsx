"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import useSWR, { mutate } from "swr"

interface License {
  id: string
  category: string
  subType: string
  name: string
  description: string
  price: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LicenseTable() {
  const { toast } = useToast()
  const { data: licenses, error, isLoading } = useSWR<License[]>('/api/admin/licenses', fetcher)

  async function deleteLicense(id: string) {
    try {
      const response = await fetch(`/api/admin/licenses/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error()

      // Revalidate data
      mutate('/api/admin/licenses')
      
      toast({
        title: "Lisens slettet",
        description: "Lisensen ble slettet",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Kunne ikke slette lisensen",
      })
    }
  }

  if (error) {
    return <div>Feil ved lasting av lisenser</div>
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
            <TableHead>Kategori</TableHead>
            <TableHead>Underkategori</TableHead>
            <TableHead>Pris</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licenses?.map((license) => (
            <TableRow key={license.id}>
              <TableCell>{license.name}</TableCell>
              <TableCell>{license.category}</TableCell>
              <TableCell>{license.subType}</TableCell>
              <TableCell>{license.price} kr</TableCell>
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
                      onClick={() => window.location.href = `/admin/licenses/edit/${license.id}`}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Rediger
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteLicense(license.id)}
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