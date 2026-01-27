"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { nb } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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

  return (
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
          disabled={(date) => {
            const today = new Date(new Date().setHours(0, 0, 0, 0))
            // Kan ikke velge før i dag
            if (date < today) return true
            // Kan ikke velge før fromDate hvis satt
            if (fromDate && date < fromDate) return true
            // Kan ikke velge etter toDate hvis satt
            if (toDate && date > toDate) return true
            return false
          }}
          defaultMonth={date || fromDate || new Date()}
        />
      </PopoverContent>
    </Popover>
  )
} 