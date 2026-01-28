"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { nb } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  label?: string
  fromDate?: Date // Minimum dato som kan velges
  toDate?: Date // Maksimum dato som kan velges
}

export function DatePicker({ date, setDate, label, fromDate, toDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const today = React.useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    []
  )

  const minDateForInput = React.useMemo(() => {
    if (fromDate && fromDate > today) {
      return fromDate
    }
    return today
  }, [fromDate, today])

  const maxDateForInput = toDate

  return (
    <div className="w-full">
      {/* Mobil: bruk stor native dato-velger for bedre UX */}
      <div className="block sm:hidden">
        <div className="relative">
          <Input
            type="date"
            className="w-full h-11 pr-10 text-base"
            value={date ? format(date, "yyyy-MM-dd") : ""}
            min={format(minDateForInput, "yyyy-MM-dd")}
            max={maxDateForInput ? format(maxDateForInput, "yyyy-MM-dd") : undefined}
            onChange={(event) => {
              const value = event.target.value
              if (!value) {
                setDate(undefined)
                return
              }
              const nextDate = new Date(`${value}T00:00:00`)
              setDate(nextDate)
            }}
          />
          <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Desktop / nettbrett: behold kalender-popover */}
      <div className="hidden sm:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full h-11 justify-start text-left font-normal text-base",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {date ? format(date, "PPP", { locale: nb }) : <span>{label || "Velg dato"}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 shadow-2xl border-2 bg-background" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate)
                setOpen(false)
              }}
              initialFocus
              locale={nb}
              weekStartsOn={1}
              disabled={(currentDate) => {
                // Kan ikke velge før i dag
                if (currentDate < today) return true
                // Kan ikke velge før fromDate hvis satt
                if (fromDate && currentDate < fromDate) return true
                // Kan ikke velge etter toDate hvis satt
                if (toDate && currentDate > toDate) return true
                return false
              }}
              defaultMonth={date || fromDate || new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 