"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ClockIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { getAvailableSlots } from "@/app/actions/availability"

interface SlotSelectorProps {
  date: Date
  serviceDuration: number
  selected: string | null
  onSelect: (slot: string) => void
}

export function SlotSelector({ date, serviceDuration, selected, onSelect }: SlotSelectorProps) {
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSlots() {
      setLoading(true)
      try {
        const dateString = format(date, "yyyy-MM-dd")
        const availableSlots = await getAvailableSlots(dateString, serviceDuration)
        setSlots(availableSlots)
      } catch (error) {
        console.error("[v0] Error loading slots:", error)
        setSlots([])
      } finally {
        setLoading(false)
      }
    }
    loadSlots()
  }, [date, serviceDuration])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center py-8">
          <Spinner className="size-8" />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Seleziona un orario</h3>
        <div className="text-muted-foreground flex h-32 items-center justify-center text-center">
          <div>
            <ClockIcon className="mx-auto mb-2 size-8 opacity-50" />
            <p className="font-medium">Nessun orario disponibile per questa data.</p>
            <p className="text-sm">Prova a selezionare un altro giorno.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Seleziona un orario</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {slots.map((slot) => (
          <button
            key={slot}
            onClick={() => onSelect(slot)}
            className={cn(
              "hover:border-primary focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all focus-visible:ring-[3px] focus-visible:outline-none",
              selected === slot
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-border hover:bg-accent/50 hover:shadow-sm",
            )}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  )
}
