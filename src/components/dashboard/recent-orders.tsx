"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Siste Ordrer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Placeholder for ordrer - vil bli erstattet med faktiske data */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="font-medium">#ORD-001</p>
              <p className="text-sm text-muted-foreground">
                Banedag - Racing
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">kr 220</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(new Date())}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">#ORD-002</p>
              <p className="text-sm text-muted-foreground">
                Konkurranse - Bilcross
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">kr 420</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(new Date())}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 