"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { DatePicker } from "@/components/ui/date-picker"
import { useSession } from "next-auth/react"

interface Club {
  id: string
  name: string
  shortName: string
}

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

export default function ProductList() {
  const [step, setStep] = useState(1)
  const [clubs, setClubs] = useState<Club[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedClub, setSelectedClub] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedSubType, setSelectedSubType] = useState("")
  const [driverName, setDriverName] = useState("")
  const [vehicleReg, setVehicleReg] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)

  const { addItem, items } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()

  // Hent både klubber og lisenskategorier når komponenten lastes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hent klubber
        const clubsResponse = await fetch('/api/clubs')
        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json()
          setClubs(clubsData)
        }

        // Hent lisenskategorier
        const categoriesResponse = await fetch('/api/licenses/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Kunne ikke hente data:', error)
      }
    }
    fetchData()
  }, [])

  // Finn valgt kategori og underkategori
  const activeCategory = categories.find(cat => cat.id === selectedCategoryId)
  const selectedLicense = activeCategory?.subTypes.find(st => st.id === selectedSubType)

  const handleNext = () => {
    if (step === 1 && !selectedClub) {
      toast({
        title: "Velg klubb",
        description: "Du må velge en klubb for å fortsette",
        variant: "destructive"
      })
      return
    }
    setStep(prev => prev + 1)
  }

  const handlePurchase = async () => {
    console.log("1. Starting purchase process")
    
    if (!session) {
      console.log("2. User not logged in, storing product data")
      
      // Lagre all nødvendig produktdata
      const productData = {
        id: `${selectedSubType}-${Date.now()}`, // Legg til en unik ID
        licenseId: selectedSubType,
        clubId: selectedClub,
        name: selectedLicense?.name || '',
        category: activeCategory?.name || '',
        subType: selectedLicense?.name || '',
        price: selectedLicense?.price || 0,
        driverName,
        vehicleReg,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        quantity: 1
      }
      
      console.log("3. Product data to store:", productData)

      // Legg til i handlekurven FØR vi lagrer og redirecter
      addItem(productData)

      // Lagre handlekurven i localStorage
      const cartItems = [productData]
      localStorage.setItem('savedCart', JSON.stringify(cartItems))
      
      // Redirect til checkout med returnTo parameter
      router.push('/checkout?returnTo=/checkout')
      return
    }

    console.log("2. User logged in, adding to cart directly")
    if (!selectedLicense || !activeCategory || !vehicleReg) {
      toast({
        title: "Mangler informasjon",
        description: "Vennligst fyll ut all påkrevd informasjon",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const cartItemId = `${activeCategory.id}-${selectedSubType}-${Date.now()}`
      
      // Legg til console.log for debugging
      console.log('Adding to cart with data:', {
        driverName,
        vehicleReg,
        startDate,
        endDate
      })
      
      addItem({
        id: cartItemId,
        name: selectedLicense.name,
        price: selectedLicense.price,
        category: activeCategory.name,
        subType: selectedLicense.name,
        driverName,
        vehicleReg,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        clubId: selectedClub,
        licenseId: selectedSubType,
        quantity: 1
      })

      toast({
        title: "Lagt til i handlekurv",
        description: `${selectedLicense.name} er lagt til i handlekurven.`,
      })

      // Reset form
      setSelectedSubType("")
      setDriverName("")
      setVehicleReg("")
      setStartDate(undefined)
      setEndDate(undefined)
      setStep(1)

      // Naviger direkte til checkout
      router.push("/checkout")
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Feil",
        description: "Kunne ikke legge til i handlekurv",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl text-center">
            Velg lisens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Klubb select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Velg klubb</label>
            <Select
              value={selectedClub}
              onValueChange={setSelectedClub}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Velg klubb" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClub && (
            <>
              {/* Kategori select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Velg type lisens</label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Velg type lisens" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Underkategori select */}
              {activeCategory && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Velg underkategori</label>
                  <Select
                    value={selectedSubType}
                    onValueChange={setSelectedSubType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Velg underkategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCategory.subTypes.map((subType) => (
                        <SelectItem key={subType.id} value={subType.id}>
                          {subType.name} - {formatPrice(subType.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Førernavn */}
              {selectedSubType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Førernavn</label>
                  <Input
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Skriv inn førernavn"
                    className="w-full"
                  />
                </div>
              )}

              {/* Kjøretøyregistrering */}
              {driverName && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Regnr/Vognlisens/Chassisnr</label>
                  <Input
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    placeholder="Skriv inn registreringsnummer"
                    className="w-full"
                  />
                </div>
              )}

              {/* Datoer */}
              {vehicleReg && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fra dato</label>
                    <DatePicker 
                      date={startDate}
                      setDate={setStartDate}
                      label="Velg startdato"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Til dato (valgfritt)</label>
                    <DatePicker 
                      date={endDate}
                      setDate={setEndDate}
                      label="Velg sluttdato"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="px-4 sm:px-6 py-4">
          <Button
            className="w-full"
            disabled={!selectedClub || !activeCategory || !selectedSubType || !driverName || !vehicleReg || !startDate || isLoading}
            onClick={handlePurchase}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Legger til...
              </>
            ) : (
              `Kjøp lisens${selectedLicense ? ` - ${formatPrice(selectedLicense.price)}` : ''}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 