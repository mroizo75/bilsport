"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LicenseList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktive Lisenser</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Placeholder for lisenser - vil bli erstattet med faktiske data */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">Banedag - Racing</p>
              <p className="text-sm text-muted-foreground">
                Gyldig til: 31.12.2024
              </p>
            </div>
            <div className="text-sm font-medium text-green-600">Aktiv</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Konkurranse - Bilcross</p>
              <p className="text-sm text-muted-foreground">
                Gyldig til: 31.12.2024
              </p>
            </div>
            <div className="text-sm font-medium text-green-600">Aktiv</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 