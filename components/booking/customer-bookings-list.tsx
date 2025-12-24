"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getCustomerByEmail } from "@/app/actions/customers"
import { getCustomerBookings } from "@/app/actions/customers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import Link from "next/link"
import type { Booking } from "@/types"
import { AlternativeSlotsSelector } from "./alternative-slots-selector"

export function CustomerBookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        try {
          const customer = await getCustomerByEmail(user.email)
          if (customer) {
            setCustomerId(customer.id)
            const customerBookings = await getCustomerBookings(customer.id)
            setBookings(customerBookings)
          }
        } catch (error) {
          console.error("Error loading bookings:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Caricamento prenotazioni...</p>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card className="border-2 shadow-xl">
        <CardHeader>
          <CardTitle>Le tue prenotazioni</CardTitle>
          <CardDescription>Non hai ancora effettuato prenotazioni</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/book">
            <Button className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Prenota un appuntamento
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Separate bookings with alternatives from others
  const bookingsWithAlternatives = bookings.filter(
    (b) => b.status === "ALTERNATIVE_PROPOSED" && b.alternativeSlots && b.alternativeSlots.length > 0
  )
  const otherBookings = bookings.filter(
    (b) => !(b.status === "ALTERNATIVE_PROPOSED" && b.alternativeSlots && b.alternativeSlots.length > 0)
  )

  // Calculate statistics
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED")
  const pendingBookings = bookings.filter((b) => b.status === "PENDING")
  const totalSpent = confirmedBookings.reduce((sum, b) => sum + (b.servicePrice || 0), 0)
  
  // Count services used
  const servicesUsed = new Map<string, { name: string; count: number; totalSpent: number }>()
  confirmedBookings.forEach((booking) => {
    const serviceName = booking.serviceName || "Servizio sconosciuto"
    const existing = servicesUsed.get(serviceName) || { name: serviceName, count: 0, totalSpent: 0 }
    servicesUsed.set(serviceName, {
      name: serviceName,
      count: existing.count + 1,
      totalSpent: existing.totalSpent + (booking.servicePrice || 0),
    })
  })

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {bookings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prenotazioni Totali</p>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confermate</p>
                  <p className="text-2xl font-bold text-green-600">{confirmedBookings.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Attesa</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Totale Speso</p>
                  <p className="text-2xl font-bold text-primary">€{totalSpent.toFixed(2)}</p>
                </div>
                <span className="text-2xl">€</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services Used Section */}
      {servicesUsed.size > 0 && (
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Servizi Utilizzati</CardTitle>
            <CardDescription>I servizi che hai già utilizzato</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from(servicesUsed.values())
                .sort((a, b) => b.count - a.count)
                .map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Utilizzato {service.count} {service.count === 1 ? "volta" : "volte"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">€{service.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">totale</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Bookings with alternatives - show first */}
      {bookingsWithAlternatives.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-bold">Slot alternativi da selezionare</h2>
          </div>
          {bookingsWithAlternatives.map((booking) => (
            <Card key={booking.id} className="border-2 border-amber-200 bg-amber-50/50 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{booking.serviceName}</CardTitle>
                    <CardDescription>
                      Prenotazione originale: {format(new Date(booking.date), "EEEE d MMMM yyyy", { locale: it })}{" "}
                      alle {booking.startTime}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Alternative proposte
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Lo slot richiesto non è disponibile. Seleziona uno degli slot alternativi proposti:
                </p>
                <AlternativeSlotsSelector booking={booking} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Other bookings */}
      {otherBookings.length > 0 && (
        <div className="space-y-4">
          {bookingsWithAlternatives.length > 0 && (
            <h2 className="text-2xl font-bold">Le tue prenotazioni</h2>
          )}
          <div className="grid gap-4">
            {otherBookings.map((booking) => (
              <Card key={booking.id} className="border-2 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{booking.serviceName}</CardTitle>
                      <CardDescription>
                        {format(new Date(booking.date), "EEEE d MMMM yyyy", { locale: it })} alle {booking.startTime} -{" "}
                        {booking.endTime}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        booking.status === "CONFIRMED"
                          ? "default"
                          : booking.status === "REJECTED"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {booking.status === "CONFIRMED" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {booking.status === "REJECTED" && <XCircle className="mr-1 h-3 w-3" />}
                      {booking.status === "PENDING" && <Clock className="mr-1 h-3 w-3" />}
                      {booking.status === "CONFIRMED"
                        ? "Confermata"
                        : booking.status === "REJECTED"
                        ? "Rifiutata"
                        : booking.status === "PENDING"
                        ? "In attesa"
                        : booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>€{booking.servicePrice?.toFixed(2) || "0.00"}</span>
                      </div>
                      {booking.rejectionReason && (
                        <p className="text-sm text-destructive">Motivo: {booking.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Book new appointment */}
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6">
          <Link href="/book">
            <Button variant="outline" className="w-full" size="lg">
              <Calendar className="mr-2 h-4 w-4" />
              Prenota un nuovo appuntamento
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

