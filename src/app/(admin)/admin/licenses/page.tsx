"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  description?: string
  subTypes: SubType[]
}

interface SubType {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
}

export default function LicensesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [newSubType, setNewSubType] = useState({
    categoryId: "",
    name: "",
    price: "",
    description: ""
  })

  // Last inn kategorier når siden lastes
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/licenses/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Kunne ikke hente kategorier:', error)
    }
  }

  const addCategory = async () => {
    try {
      const response = await fetch("/api/licenses/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory })
      })
      
      if (!response.ok) throw new Error("Kunne ikke legge til kategori")
      
      toast({
        title: "Kategori lagt til",
        description: "Kategorien ble lagt til i systemet"
      })
      setNewCategory("")
      fetchCategories() // Oppdater listen
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke legge til kategori",
        variant: "destructive"
      })
    }
  }

  const addSubType = async () => {
    try {
      if (!newSubType.categoryId || !newSubType.name || !newSubType.price) {
        throw new Error("Alle felt må fylles ut")
      }

      const response = await fetch("/api/licenses/subtypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: newSubType.categoryId,
          name: newSubType.name,
          price: parseFloat(newSubType.price),
          description: newSubType.description || undefined
        })
      })
      
      if (!response.ok) throw new Error("Kunne ikke legge til underkategori")
      
      toast({
        title: "Underkategori lagt til",
        description: "Underkategorien ble lagt til i systemet"
      })
      setNewSubType({ categoryId: "", name: "", price: "", description: "" })
      fetchCategories() // Oppdater listen
    } catch (error) {
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke legge til underkategori",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-8">Administrer Lisenser</h1>
      
      {/* Legg til hovedkategori */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Legg til ny hovedkategori</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Kategorinavn"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Button onClick={addCategory}>Legg til kategori</Button>
        </div>
      </div>

      {/* Legg til underkategori */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Legg til ny underkategori</h2>
        <div className="grid grid-cols-3 gap-4">
          <Select
            value={newSubType.categoryId}
            onValueChange={(value) => 
              setNewSubType(prev => ({ ...prev, categoryId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Underkategorinavn"
            value={newSubType.name}
            onChange={(e) => 
              setNewSubType(prev => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Pris"
            value={newSubType.price}
            onChange={(e) => 
              setNewSubType(prev => ({ ...prev, price: e.target.value }))
            }
          />
          <Button onClick={addSubType} className="col-span-3">
            Legg til underkategori
          </Button>
        </div>
      </div>

      {/* Vis eksisterende lisenser */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Eksisterende lisenser</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hovedkategori</TableHead>
              <TableHead>Underkategori</TableHead>
              <TableHead>Pris</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(category => 
              category.subTypes.map(subType => (
                <TableRow key={subType.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{subType.name}</TableCell>
                  <TableCell>{subType.price} kr</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Rediger
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 