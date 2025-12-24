"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { CalendarIcon, ClockIcon, DollarSignIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { Service } from "@/types"
import { createBooking } from "@/app/actions/create-booking"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getCustomerByEmail } from "@/app/actions/customers"

interface BookingSummaryProps {
  service: Service
  date: Date
  slot: string
  onSuccess: () => void
}

export function BookingSummary({ service, date, slot, onSuccess }: BookingSummaryProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const customer = await getCustomerByEmail(user.email)
        if (customer) {
          setCustomerId(customer.id)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const handleConfirm = async () => {
    // Double check authentication before proceeding
    const user = auth.currentUser
    if (!user || !user.email) {
      setError("Devi essere autenticato per prenotare. Effettua il login e riprova.")
      return
    }

    if (!customerId) {
      // Try to get customer one more time
      try {
        const customer = await getCustomerByEmail(user.email)
        if (!customer) {
          setError("Account cliente non trovato. Registrati per continuare.")
          return
        }
        setCustomerId(customer.id)
      } catch (error) {
        setError("Errore durante la verifica dell'account. Effettua il login e riprova.")
        return
      }
    }

    if (!customerId) {
      setError("Devi essere autenticato per prenotare. Effettua il login e riprova.")
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login?redirect=/book")
      }, 2000)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createBooking({
        serviceId: service.id,
        date: format(date, "yyyy-MM-dd"),
        startTime: slot,
        userId: customerId,
      })

      if (result.success) {
        setConfirmed(true)
        // Redirect to account page after 2 seconds
        setTimeout(() => {
          router.push("/account")
        }, 2000)
      } else {
        setError(result.error || "Failed to create booking. Please try again.")
      }
    } catch (err) {
      console.error("[v0] Error creating booking:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <div className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-full shadow-lg">
          <CheckCircleIcon className="size-10" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Prenotazione confermata!</h3>
          <p className="text-muted-foreground mt-2 text-lg">Il tuo appuntamento è stato programmato con successo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Rivedi la tua prenotazione</h3>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircleIcon className="size-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4 rounded-xl border-2 bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
            <DollarSignIcon className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Servizio</p>
            <p className="text-lg font-semibold">{service.name}</p>
            <p className="mt-1 text-xl font-bold text-primary">{service.price}€</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
            <CalendarIcon className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Data</p>
            <p className="text-lg font-semibold">{format(date, "EEEE d MMMM yyyy", { locale: it })}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
            <ClockIcon className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Orario</p>
            <p className="text-lg font-semibold">
              {slot} <span className="text-sm text-muted-foreground">({service.duration} minuti)</span>
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleConfirm} disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Spinner />
            Conferma in corso...
          </>
        ) : (
          "Conferma prenotazione"
        )}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        La tua prenotazione sarà in attesa fino alla conferma del salone.
      </p>
    </div>
  )
}
