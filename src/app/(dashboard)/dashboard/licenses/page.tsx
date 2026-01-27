"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { CalendarIcon, CarIcon, UserIcon, ClockIcon, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface License {
  id: string
  orderId: string
  status: string
  totalAmount: number
  validFrom: string
  validTo?: string
  licenseName: string
  clubName: string
  driverName: string
  vehicleReg: string
  paymentStatus: string
}

// Ny komponent for dialog-innhold
function LicenseDialog({ license, isActive }: { license: License, isActive: boolean }) {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold flex items-center justify-between">
          <span>{license.licenseName}</span>
          <Badge className={isActive ? "bg-green-500" : "bg-red-500"}>
            {isActive ? "Aktiv" : "Utgått"}
          </Badge>
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Ordredetaljer */}
        <div className="space-y-3">
          <h3 className="font-semibold border-b pb-2">Ordredetaljer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground block">Ordrenummer</span>
              <span className="font-medium">{license.orderId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Status</span>
              <span className="font-medium">{license.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Klubb</span>
              <span className="font-medium">{license.clubName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Beløp</span>
              <span className="font-medium">{formatPrice(license.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Personlig informasjon */}
        <div className="space-y-3">
          <h3 className="font-semibold border-b pb-2">Personlig Informasjon</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground block">Fører</span>
              <span className="font-medium">{license.driverName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Registreringsnummer</span>
              <span className="font-medium">{license.vehicleReg}</span>
            </div>
          </div>
        </div>

        {/* Gyldighet */}
        <div className="space-y-3">
          <h3 className="font-semibold border-b pb-2">Gyldighet</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground block">Fra dato</span>
              <span className="font-medium">
                {new Date(license.validFrom).toLocaleDateString('no-NO')}
              </span>
            </div>
            {license.validTo && (
              <div>
                <span className="text-muted-foreground block">Til dato</span>
                <span className="font-medium">
                  {new Date(license.validTo).toLocaleDateString('no-NO')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold">{formatPrice(license.totalAmount || 0)}</span>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

export default function LicensesPage() {
  const { data: session } = useSession()
  const [licenses, setLicenses] = useState<License[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          setLicenses(data.orders || [])
        }
      } catch (error) {
        console.error('Error fetching licenses:', error)
        setLicenses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLicenses()
  }, [])

  // Oppdatert filtrering - basert på din beskrivelse
  const now = new Date()

  // Først filtrer vi ut fullførte ordrer
  const completedLicenses = licenses.filter(license => 
    license.status === "COMPLETED"
  )

  // Deretter deler vi dem opp i tidligere og fremtidige ordrer
  const pastLicenses = completedLicenses.filter(license => 
    new Date(license.validFrom) < now  // Datoer som har vært
  )

  const futureLicenses = completedLicenses.filter(license => 
    new Date(license.validFrom) >= now  // Datoer som ikke har vært enda
  )

  // Sortering
  const sortedExpiredLicenses = [...pastLicenses].sort(
    (a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
  )

  const sortedActiveLicenses = [...futureLicenses].sort(
    (a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
  )

  // Finn den nyeste lisensen
  const newestLicense = sortedActiveLicenses[0]

  if (isLoading) return <div>Laster...</div>

  return (
    <div className="container space-y-8 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Mine Lisenser</h1>
      </div>

      {/* Nyeste lisens - stor visning */}
      {newestLicense && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Nyeste Lisens</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="p-6">
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold block mb-2">{newestLicense.licenseName}</span>
                      <span className="text-muted-foreground text-sm block">{newestLicense.clubName}</span>
                    </div>
                    <Badge className="bg-green-500 hover:bg-green-600">Aktiv</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 mr-2" />
                        <span>{newestLicense.driverName}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CarIcon className="h-5 w-5 mr-2" />
                        <span>{newestLicense.vehicleReg}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        <span>{new Date(newestLicense.validFrom).toLocaleDateString('no-NO')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <LicenseDialog license={newestLicense} isActive={true} />
          </Dialog>
        </div>
      )}

      {/* Andre lisenser */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Aktive ({sortedActiveLicenses.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Utgåtte ({sortedExpiredLicenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedActiveLicenses.map((license) => (
              <div key={license.id}>
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center justify-between text-base">
                          <span className="font-semibold truncate mr-2">{license.licenseName}</span>
                          <Badge 
                            className={sortedActiveLicenses.includes(license) ? 
                              "bg-green-500 hover:bg-green-600 whitespace-nowrap" : 
                              "bg-red-500 hover:bg-red-600 whitespace-nowrap"}
                          >
                            {sortedActiveLicenses.includes(license) ? "Aktiv" : "Utgått"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{license.driverName}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{license.vehicleReg}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(license.validFrom).toLocaleDateString('no-NO')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <LicenseDialog 
                    license={license} 
                    isActive={sortedActiveLicenses.includes(license)} 
                  />
                </Dialog>
              </div>
            ))}
          </div>
          
          {sortedActiveLicenses.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Du har ingen aktive lisenser</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedExpiredLicenses.map((license) => (
              <div key={license.id}>
                <Dialog>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center justify-between text-base">
                          <span className="font-semibold truncate mr-2">{license.licenseName}</span>
                          <Badge 
                            className={sortedActiveLicenses.includes(license) ? 
                              "bg-green-500 hover:bg-green-600 whitespace-nowrap" : 
                              "bg-red-500 hover:bg-red-600 whitespace-nowrap"}
                          >
                            {sortedActiveLicenses.includes(license) ? "Aktiv" : "Utgått"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{license.driverName}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{license.vehicleReg}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(license.validFrom).toLocaleDateString('no-NO')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <LicenseDialog 
                    license={license} 
                    isActive={sortedActiveLicenses.includes(license)} 
                  />
                </Dialog>
              </div>
            ))}
          </div>
          
          {sortedExpiredLicenses.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Du har ingen utgåtte lisenser</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 