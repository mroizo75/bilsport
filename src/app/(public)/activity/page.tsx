"use client"

import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shell } from "@/components/shell"

interface Activity {
  id: string
  date: string
  registeredCount: number
  maxParticipants: number | null
  clubId: string
  clubName: string
}

interface Club {
  id: string
  name: string
  activities: Activity[]
}

interface GroupedActivity {
  date: string
  totalCount: number
  maxParticipants: number | null
}

export default function ActivityPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs/activities')
        if (!response.ok) throw new Error('Failed to fetch clubs')
        const data = await response.json()
        setClubs(data)
      } catch (error) {
        console.error('Error fetching clubs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClubs()
  }, [])

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupActivitiesByDate = (activities: Activity[]): GroupedActivity[] => {
    const grouped = activities.reduce((acc, activity) => {
      const date = activity.date
      if (!acc[date]) {
        acc[date] = {
          date,
          totalCount: 0,
          maxParticipants: activity.maxParticipants
        }
      }
      acc[date].totalCount += activity.registeredCount
      return acc
    }, {} as Record<string, GroupedActivity>)

    return Object.values(grouped).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  const ClubActivitiesDialog = ({ club }: { club: Club | null }) => {
    if (!club) return null

    const groupedActivities = groupActivitiesByDate(club.activities)

    return (
      <DialogContent className="w-[95vw] max-w-3xl p-0 sm:p-6">
        <DialogHeader className="p-4 sm:p-0 space-y-1">
          <DialogTitle className="text-xl sm:text-2xl">{club.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">Oversikt over aktiviteter og påmeldte</p>
        </DialogHeader>
        <ScrollArea className="h-[60vh] sm:h-[70vh] mt-4">
          <div className="p-4 sm:p-0 space-y-4">
            {/* Desktop visning */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-3/4">Race Dato</TableHead>
                    <TableHead className="text-right">Påmeldte</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedActivities.map((activity) => (
                    <TableRow key={activity.date}>
                      <TableCell className="font-medium">
                        {new Date(activity.date).toLocaleDateString('no-NO', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                          {activity.totalCount}
                          {activity.maxParticipants && ` / ${activity.maxParticipants}`}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobil visning */}
            <div className="grid sm:hidden gap-4">
              {groupedActivities.map((activity) => (
                <Card key={activity.date} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="font-medium">
                        {new Date(activity.date).toLocaleDateString('no-NO', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {new Date(activity.date).getFullYear()}
                        </span>
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                          {activity.totalCount}
                          {activity.maxParticipants && ` / ${activity.maxParticipants}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Laster...</div>
      </div>
    )
  }

  return (
    <Shell>
      <div className="container space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            Klubbaktiviteter
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base text-center max-w-[600px]">
            Se antall påmeldte per race-dato hos våre klubber
          </p>
          <div className="w-full max-w-md">
            <Input
              placeholder="Søk etter klubb..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Desktop visning */}
        <div className="hidden sm:block rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klubb</TableHead>
                <TableHead className="text-right w-[100px]">Datoer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClubs.map((club) => (
                <TableRow 
                  key={club.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedClub(club)
                    setDialogOpen(true)
                  }}
                >
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
                      {club.activities.length}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobil visning */}
        <div className="grid sm:hidden gap-4">
          {filteredClubs.map((club) => (
            <Card 
              key={club.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => {
                setSelectedClub(club)
                setDialogOpen(true)
              }}
            >
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{club.name}</CardTitle>
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
                    {club.activities.length}
                  </span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <ClubActivitiesDialog club={selectedClub} />
        </Dialog>
      </div>
    </Shell>
  )
} 