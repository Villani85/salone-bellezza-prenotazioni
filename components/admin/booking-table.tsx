"use client"

import { useState, useEffect } from "react"
import { approveBooking, rejectBooking, proposeAlternatives, type BookingWithDetails } from "@/app/actions/admin-bookings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Calendar, User, Phone, Mail, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { it } from "date-fns/locale"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getAvailableSlots } from "@/app/actions/availability"

interface BookingTableProps {
  bookings: BookingWithDetails[]
}

export function BookingTable({ bookings }: BookingTableProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [alternativesDialogOpen, setAlternativesDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [availableAlternatives, setAvailableAlternatives] = useState<
    Array<{ date: string; startTime: string; endTime: string }>
  >([])
  const [selectedAlternatives, setSelectedAlternatives] = useState<
    Array<{ date: string; startTime: string; endTime: string }>
  >([])
  const [loadingAlternatives, setLoadingAlternatives] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user?.uid || null)
    })
    return () => unsubscribe()
  }, [])

  const handleApprove = async (id: string) => {
    if (!currentUserId) {
      alert("Errore: utente non autenticato")
      return
    }

    setLoadingId(id)
    const result = await approveBooking(id, currentUserId)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Errore durante l'approvazione della prenotazione")
    }
    setLoadingId(null)
  }

  const handleRejectClick = (booking: BookingWithDetails) => {
    setSelectedBooking(booking)
    setRejectionReason("")
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!currentUserId || !selectedBooking) {
      return
    }

    setLoadingId(selectedBooking.id)
    const result = await rejectBooking(selectedBooking.id, currentUserId, rejectionReason || undefined)
    if (result.success) {
      setRejectDialogOpen(false)
      setSelectedBooking(null)
      setRejectionReason("")
      router.refresh()
    } else {
      alert(result.error || "Errore durante il rifiuto della prenotazione")
    }
    setLoadingId(null)
  }

  const handleProposeAlternativesClick = async (booking: BookingWithDetails) => {
    setSelectedBooking(booking)
    setSelectedAlternatives([])
    setAvailableAlternatives([])
    setAlternativesDialogOpen(true)
    await loadAvailableAlternatives(booking)
  }

  const loadAvailableAlternatives = async (booking: BookingWithDetails) => {
    setLoadingAlternatives(true)
    try {
      // Calculate service duration from booking times
      const [startH, startM] = booking.startTime.split(":").map(Number)
      const [endH, endM] = booking.endTime.split(":").map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM
      const serviceDuration = endMinutes - startMinutes

      // Get available slots for next 5 days starting from booking date
      const bookingDate = new Date(booking.date)
      const slots: Array<{ date: string; startTime: string; endTime: string }> = []

      for (let i = 1; i <= 7; i++) {
        const checkDate = addDays(bookingDate, i)
        const dateStr = format(checkDate, "yyyy-MM-dd")
        
        const availableTimes = await getAvailableSlots(dateStr, serviceDuration)
        
        // Add first 2 available slots for this day
        availableTimes.slice(0, 2).forEach((time) => {
          const [hours, minutes] = time.split(":").map(Number)
          const endTime = new Date(checkDate)
          endTime.setHours(hours, minutes + serviceDuration, 0)
          
          slots.push({
            date: dateStr,
            startTime: time,
            endTime: format(endTime, "HH:mm"),
          })
        })

        if (slots.length >= 10) break // Max 10 slots to choose from
      }

      setAvailableAlternatives(slots.slice(0, 10)) // Show up to 10 slots
    } catch (error) {
      console.error("Error loading alternatives:", error)
    } finally {
      setLoadingAlternatives(false)
    }
  }

  const handleProposeAlternativesConfirm = async () => {
    if (!currentUserId || !selectedBooking || selectedAlternatives.length === 0) {
      return
    }

    setLoadingId(selectedBooking.id)
    const result = await proposeAlternatives(selectedBooking.id, selectedAlternatives, currentUserId)
    if (result.success) {
      setAlternativesDialogOpen(false)
      setSelectedBooking(null)
      setSelectedAlternatives([])
      setAvailableAlternatives([])
      router.refresh()
    } else {
      alert(result.error || "Errore durante la proposta di alternative")
    }
    setLoadingId(null)
  }

  const toggleAlternativeSlot = (slot: { date: string; startTime: string; endTime: string }) => {
    const exists = selectedAlternatives.some(
      (s) => s.date === slot.date && s.startTime === slot.startTime
    )
    
    if (exists) {
      setSelectedAlternatives(selectedAlternatives.filter((s) => !(s.date === slot.date && s.startTime === slot.startTime)))
    } else {
      if (selectedAlternatives.length < 3) {
        setSelectedAlternatives([...selectedAlternatives, slot])
      } else {
        alert("Massimo 3 slot alternativi possono essere proposti")
      }
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No pending bookings</h3>
        <p className="text-sm text-muted-foreground">All booking requests have been processed</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Service</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Time</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Price</th>
              <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b">
                <td className="py-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{booking.customerName}</span>
                    {booking.customerEmail && (
                      <span className="text-xs text-muted-foreground">{booking.customerEmail}</span>
                    )}
                    {booking.customerPhone && (
                      <span className="text-xs text-muted-foreground">{booking.customerPhone}</span>
                    )}
                  </div>
                </td>
                <td className="py-4">
                  <span className="font-medium">{booking.serviceName}</span>
                </td>
                <td className="py-4">
                  <span>{format(new Date(booking.date), "MMM dd, yyyy")}</span>
                </td>
                <td className="py-4">
                  <span>
                    {booking.startTime} - {booking.endTime}
                  </span>
                </td>
                <td className="py-4">
                  <span className="font-medium">€{booking.servicePrice.toFixed(2)}</span>
                </td>
                <td className="py-4">
                  <div className="flex justify-end gap-2 flex-wrap">
                    {booking.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(booking.id)}
                          disabled={loadingId === booking.id}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Approva
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProposeAlternativesClick(booking)}
                          disabled={loadingId === booking.id || loadingAlternatives}
                        >
                          <Clock className="mr-1 h-4 w-4" />
                          Alternative
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(booking)}
                          disabled={loadingId === booking.id}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Rifiuta
                        </Button>
                      </>
                    )}
                    {booking.status === "ALTERNATIVE_PROPOSED" && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Alternative Proposte
                      </Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{booking.customerName}</span>
                </div>
                {booking.customerEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{booking.customerEmail}</span>
                  </div>
                )}
                {booking.customerPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{booking.customerPhone}</span>
                  </div>
                )}
              </div>
              <Badge variant="outline">{booking.status}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{booking.serviceName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{format(new Date(booking.date), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-semibold">€{booking.servicePrice.toFixed(2)}</span>
              </div>
            </div>

            {booking.status === "PENDING" && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handleApprove(booking.id)}
                  disabled={loadingId === booking.id}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approva
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleProposeAlternativesClick(booking)}
                  disabled={loadingId === booking.id || loadingAlternatives}
                >
                  <Clock className="mr-1 h-4 w-4" />
                  Alternative
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleRejectClick(booking)}
                  disabled={loadingId === booking.id}
                >
                  <X className="mr-1 h-4 w-4" />
                  Rifiuta
                </Button>
              </div>
            )}
            {booking.status === "ALTERNATIVE_PROPOSED" && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 w-full justify-center">
                <AlertCircle className="mr-1 h-3 w-3" />
                Alternative Proposte
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rifiuta Prenotazione</DialogTitle>
            <DialogDescription>
              Stai per rifiutare la prenotazione. Puoi opzionalmente fornire un motivo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBooking && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">{selectedBooking.customerName}</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.serviceName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedBooking.date), "dd/MM/yyyy")} alle {selectedBooking.startTime}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Motivo (opzionale)</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Es: Slot non disponibile, salone chiuso..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={loadingId !== null}>
              {loadingId ? "Rifiutando..." : "Rifiuta Prenotazione"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Propose Alternatives Dialog */}
      <Dialog open={alternativesDialogOpen} onOpenChange={setAlternativesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proponi Slot Alternativi</DialogTitle>
            <DialogDescription>
              Seleziona fino a 3 slot alternativi da proporre al cliente. (Max 3)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBooking && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Prenotazione originale:</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedBooking.date), "dd/MM/yyyy")} alle {selectedBooking.startTime}
                </p>
              </div>
            )}

            {loadingAlternatives ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Caricamento slot disponibili...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedAlternatives.length > 0 && (
                  <div className="space-y-2">
                    <Label>Slot selezionati: {selectedAlternatives.length}/3</Label>
                    <div className="grid gap-2 max-h-32 overflow-y-auto border rounded-lg p-2 bg-primary/5">
                      {selectedAlternatives.map((slot, idx) => (
                        <div
                          key={`selected-${slot.date}-${slot.startTime}`}
                          className="flex items-center justify-between p-2 border rounded bg-background"
                        >
                          <span className="text-sm font-medium">
                            Opzione {idx + 1}: {format(new Date(slot.date), "dd/MM/yyyy")} alle {slot.startTime}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleAlternativeSlot(slot)}
                            className="h-6 w-6 p-0 text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Slot disponibili (clicca per selezionare, max 3):</Label>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {availableAlternatives.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nessuno slot disponibile trovato. Prova a cercare manualmente gli slot.
                      </p>
                    ) : (
                      availableAlternatives.map((slot) => {
                        const isSelected = selectedAlternatives.some(
                          (s) => s.date === slot.date && s.startTime === slot.startTime
                        )
                        return (
                          <button
                            key={`${slot.date}-${slot.startTime}`}
                            type="button"
                            onClick={() => toggleAlternativeSlot(slot)}
                            disabled={!isSelected && selectedAlternatives.length >= 3}
                            className={`flex items-center justify-between p-3 border rounded-lg text-left transition-colors ${
                              isSelected
                                ? "bg-primary/10 border-primary border-2"
                                : selectedAlternatives.length >= 3
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-muted border-border"
                            }`}
                          >
                            <div>
                              <p className="font-medium">
                                {format(new Date(slot.date), "dd/MM/yyyy")} alle {slot.startTime} - {slot.endTime}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(slot.date), "EEEE", { locale: it })}
                              </p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlternativesDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={handleProposeAlternativesConfirm}
              disabled={loadingId !== null || selectedAlternatives.length === 0}
            >
              {loadingId ? "Inviando..." : `Proponi ${selectedAlternatives.length} Slot Alternativi`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
