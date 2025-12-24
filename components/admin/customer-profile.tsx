"use client"

import { useState } from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Tag,
  FileText,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  ClockIcon,
  AlertCircle,
} from "lucide-react"
import type { Customer, Booking } from "@/types"
import { updateCustomerNotes, updateCustomerTags } from "@/app/actions/customers"
import { useRouter } from "next/navigation"

interface CustomerProfileProps {
  customer: Customer
  bookings: Booking[]
}

export function CustomerProfile({ customer: initialCustomer, bookings }: CustomerProfileProps) {
  const router = useRouter()
  const [customer] = useState(initialCustomer)
  const [notes, setNotes] = useState(customer.internalNotes || "")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      const result = await updateCustomerNotes(customer.id, notes)
      if (result.success) {
        setIsEditingNotes(false)
        router.refresh()
      } else {
        alert(result.error || "Errore durante il salvataggio delle note")
      }
    } catch (error) {
      alert("Errore durante il salvataggio delle note")
    } finally {
      setSavingNotes(false)
    }
  }

  const handleUpdateTags = async () => {
    try {
      await updateCustomerTags(customer.id)
      router.refresh()
    } catch (error) {
      alert("Errore durante l'aggiornamento dei tag")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "PENDING":
        return <ClockIcon className="h-4 w-4 text-yellow-600" />
      case "ALTERNATIVE_PROPOSED":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confermata"
      case "REJECTED":
        return "Rifiutata"
      case "PENDING":
        return "In Attesa"
      case "ALTERNATIVE_PROPOSED":
        return "Alternative Proposte"
      default:
        return status
    }
  }

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED")
  const pendingBookings = bookings.filter((b) => b.status === "PENDING" || b.status === "ALTERNATIVE_PROPOSED")

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Left Column - Customer Info */}
      <div className="md:col-span-1 space-y-6">
        <Card className="border-2 border-gray-200 bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {customer.firstName} {customer.lastName}
                </CardTitle>
                <CardDescription>{customer.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{customer.email}</span>
                {customer.emailVerified && (
                  <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-300">
                    Verificato
                  </Badge>
                )}
              </div>
              {customer.city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{customer.city}</span>
                  {customer.postalCode && <span className="text-muted-foreground">({customer.postalCode})</span>}
                </div>
              )}
              {customer.gender && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Genere: </span>
                  <span className="font-medium">{customer.gender}</span>
                </div>
              )}
              {customer.birthMonth && customer.birthDay && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Compleanno: </span>
                  <span className="font-medium">
                    {customer.birthDay}/{customer.birthMonth}
                  </span>
                </div>
              )}
              {customer.timePreference && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Preferenza oraria: </span>
                  <span className="font-medium">{customer.timePreference}</span>
                </div>
              )}
              {customer.acquisitionChannel && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Canale acquisizione: </span>
                  <span className="font-medium">{customer.acquisitionChannel}</span>
                </div>
              )}
              {customer.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Registrato: {format(new Date(customer.createdAt), "dd MMMM yyyy", { locale: it })}
                  </span>
                </div>
              )}
            </div>

            {customer.interests && customer.interests.length > 0 && (
              <div>
                <Label className="mb-2 block">Interessi</Label>
                <div className="flex flex-wrap gap-2">
                  {customer.interests.map((interest, idx) => (
                    <Badge key={idx} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {customer.tags && customer.tags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tag
                  </Label>
                  <Button size="sm" variant="ghost" onClick={handleUpdateTags} className="h-6 text-xs">
                    Aggiorna
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Note Interne
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Aggiungi note interne sul cliente..."
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
                    <Save className="mr-2 h-4 w-4" />
                    {savingNotes ? "Salvataggio..." : "Salva"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNotes(customer.internalNotes || "")
                      setIsEditingNotes(false)
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annulla
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[100px]">
                  {customer.internalNotes || "Nessuna nota interna"}
                </p>
                <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {customer.internalNotes ? "Modifica" : "Aggiungi"} Note
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Bookings History */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border-2 border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Storico Prenotazioni
            </CardTitle>
            <CardDescription>
              {confirmedBookings.length} confermate, {pendingBookings.length} in attesa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nessuna prenotazione ancora</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(booking.status)}
                      <div>
                        <p className="font-medium">{booking.serviceName || "Servizio"}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(booking.date), "dd MMM yyyy", { locale: it })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.startTime} - {booking.endTime}
                          </span>
                          {booking.servicePrice && (
                            <span className="font-medium">€{booking.servicePrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{getStatusLabel(booking.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

