"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Check, AlertCircle } from "lucide-react"
import type { Booking, AlternativeSlot } from "@/types"
import { acceptAlternativeSlot, rejectAlternativeSlots } from "@/app/actions/booking-alternatives"

interface AlternativeSlotsSelectorProps {
  booking: Booking
}

export function AlternativeSlotsSelector({ booking }: AlternativeSlotsSelectorProps) {
  const router = useRouter()
  const [selectedSlot, setSelectedSlot] = useState<AlternativeSlot | null>(null)
  const [loading, setLoading] = useState(false)

  if (!booking.alternativeSlots || booking.alternativeSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nessuno slot alternativo disponibile</p>
      </div>
    )
  }

  const handleAccept = async () => {
    if (!selectedSlot) {
      alert("Seleziona uno slot alternativo")
      return
    }

    setLoading(true)
    try {
      const result = await acceptAlternativeSlot(booking.id, selectedSlot)
      if (result.success) {
        // Redirect to account page where user can see the confirmed booking
        router.push("/account")
      } else {
        alert(result.error || "Errore durante l'accettazione dello slot")
        setLoading(false)
      }
    } catch (error) {
      alert("Errore durante l'accettazione dello slot")
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm("Sei sicuro di voler rifiutare tutti gli slot alternativi? La prenotazione verrà annullata.")) {
      return
    }

    setLoading(true)
    try {
      const result = await rejectAlternativeSlots(booking.id)
      if (result.success) {
        // Redirect to account page where user can see the rejected booking
        router.push("/account")
      } else {
        alert(result.error || "Errore durante il rifiuto")
        setLoading(false)
      }
    } catch (error) {
      alert("Errore durante il rifiuto")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {booking.alternativeSlots.map((slot, index) => {
          const isSelected = selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime
          return (
            <Card
              key={`${slot.date}-${slot.startTime}`}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? "border-2 border-primary bg-primary/5" : "border-2 border-gray-200"
              }`}
              onClick={() => setSelectedSlot(slot)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                        Opzione {index + 1}
                      </Badge>
                      {isSelected && (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Selezionato
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(slot.date), "EEEE d MMMM yyyy", { locale: it })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      {booking.servicePrice && (
                        <div className="text-sm text-muted-foreground">
                          Prezzo: <span className="font-semibold">€{booking.servicePrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex gap-4 pt-4 border-t">
        <Button
          onClick={handleAccept}
          disabled={!selectedSlot || loading}
          className="flex-1"
          size="lg"
        >
          {loading ? "Confermando..." : "Conferma Slot Selezionato"}
        </Button>
        <Button
          onClick={handleReject}
          disabled={loading}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          Rifiuta Tutti
        </Button>
      </div>

      {!selectedSlot && (
        <p className="text-sm text-center text-muted-foreground">
          Seleziona uno slot alternativo per continuare
        </p>
      )}
    </div>
  )
}

