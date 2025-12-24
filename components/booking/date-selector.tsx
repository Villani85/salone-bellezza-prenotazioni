"use client"

import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { it } from "date-fns/locale"
import { format } from "date-fns"
import { getSalonConfigForClient } from "@/app/actions/get-salon-config"
import type { SalonConfig } from "@/types"

interface DateSelectorProps {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}

export function DateSelector({ selected, onSelect }: DateSelectorProps) {
  const [salonConfig, setSalonConfig] = useState<SalonConfig | null>(null)
  
  useEffect(() => {
    getSalonConfigForClient().then(setSalonConfig)
  }, [])

  // Disable past dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isDateDisabled = (date: Date): boolean => {
    // Disable past dates
    if (date < today) {
      return true
    }

    if (!salonConfig) {
      return false
    }

    const dateStr = format(date, "yyyy-MM-dd")
    const dayOfWeek = date.getDay()

    // Disable if date is in closed dates
    if (salonConfig.closedDates?.includes(dateStr)) {
      return true
    }

    // Disable if day of week is closed
    if (salonConfig.closedDaysOfWeek?.includes(dayOfWeek)) {
      return true
    }

    return false
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Scegli una data</h3>
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          disabled={isDateDisabled}
          locale={it}
          className="rounded-xl border-2 shadow-sm"
        />
      </div>
      {salonConfig && (salonConfig.closedDaysOfWeek?.length > 0 || salonConfig.closedDates?.length > 0) && (
        <p className="text-sm text-muted-foreground text-center">
          I giorni chiusi sono disabilitati nel calendario
        </p>
      )}
    </div>
  )
}
