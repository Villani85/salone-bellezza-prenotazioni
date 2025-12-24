import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlternativeSlotsSelector } from "@/components/booking/alternative-slots-selector"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { Booking } from "@/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AlternativePageProps {
  params: Promise<{ id: string }>
}

export default async function AlternativeSlotsPage({ params }: AlternativePageProps) {
  const { id } = await params
  const bookingRef = doc(db, "bookings", id)
  const bookingSnap = await getDoc(bookingRef)

  if (!bookingSnap.exists()) {
    notFound()
  }

  const bookingData = bookingSnap.data()
  const booking: Booking = {
    id: bookingSnap.id,
    date: bookingData.date,
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
    status: bookingData.status,
    customerId: bookingData.customerId,
    serviceId: bookingData.serviceId,
    salonId: bookingData.salonId,
    rejectionReason: bookingData.rejectionReason,
    alternativeSlots: bookingData.alternativeSlots,
    selectedAlternativeSlot: bookingData.selectedAlternativeSlot,
    serviceName: bookingData.serviceName,
    servicePrice: bookingData.servicePrice,
    customerName: bookingData.customerName,
    customerEmail: bookingData.customerEmail,
    createdAt: bookingData.createdAt,
    updatedAt: bookingData.updatedAt,
    confirmedBy: bookingData.confirmedBy,
    rejectedBy: bookingData.rejectedBy,
  }

  if (booking.status !== "ALTERNATIVE_PROPOSED" || !booking.alternativeSlots || booking.alternativeSlots.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2">
          <CardHeader>
            <CardTitle>Nessuna alternativa disponibile</CardTitle>
            <CardDescription>
              Questa prenotazione non ha slot alternativi proposti o è già stata gestita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna alla home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla home
          </Button>
        </Link>
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Slot Alternativi Proposti</CardTitle>
            <CardDescription>
              Lo slot richiesto non è disponibile. Seleziona uno degli slot alternativi proposti dal salone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Prenotazione originale:</p>
              <p className="text-sm text-muted-foreground">
                {booking.serviceName} - {new Date(booking.date).toLocaleDateString("it-IT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                alle {booking.startTime}
              </p>
            </div>
            <AlternativeSlotsSelector booking={booking} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

