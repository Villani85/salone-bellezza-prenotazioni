"use server"

import { getAdminDb } from "@/lib/firebase-admin"
import type { Booking, AlternativeSlot } from "@/types"
import { logger } from "@/lib/logger"
import { sendBookingConfirmationEmail } from "./email"
import { getCustomerById } from "./customers"

/**
 * Accept an alternative slot for a booking
 */
export async function acceptAlternativeSlot(
  bookingId: string,
  selectedSlot: AlternativeSlot
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()

  try {
    if (!bookingId || !selectedSlot) {
      return { success: false, error: "Booking ID and selected slot are required" }
    }

    if (!selectedSlot.date || !selectedSlot.startTime || !selectedSlot.endTime) {
      return { success: false, error: "Lo slot selezionato non è valido" }
    }

    // Verify booking exists and is in correct status using Admin SDK
    const adminDb = getAdminDb()
    const bookingRef = adminDb.collection("bookings").doc(bookingId)
    const bookingSnap = await bookingRef.get()

    if (!bookingSnap.exists) {
      logger.warn("Attempted to accept alternative for non-existent booking", { bookingId })
      return { success: false, error: "Prenotazione non trovata" }
    }

    const bookingData = bookingSnap.data() as Partial<Booking> | undefined
    if (!bookingData) {
      logger.error("Booking snapshot exists but data is undefined", { bookingId })
      return { success: false, error: "Dati prenotazione non disponibili" }
    }

    if (bookingData.status !== "ALTERNATIVE_PROPOSED") {
      logger.warn("Attempted to accept alternative for booking with invalid status", {
        bookingId,
        currentStatus: bookingData.status,
      })
      return { success: false, error: "La prenotazione non ha slot alternativi proposti" }
    }

    // Verify selected slot is in the proposed alternatives
    const alternativeSlots = (bookingData.alternativeSlots || []) as AlternativeSlot[]
    const isValidSlot = alternativeSlots.some(
      (slot) => slot.date === selectedSlot.date && slot.startTime === selectedSlot.startTime
    )

    if (!isValidSlot) {
      return { success: false, error: "Lo slot selezionato non è tra quelli proposti" }
    }

    // Update booking with selected alternative using Admin SDK
    const updateData: Partial<Booking> & Record<string, any> = {
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      status: "CONFIRMED",
      selectedAlternativeSlot: selectedSlot,
      updatedAt: new Date().toISOString(),
      // opzionale: svuota gli slot proposti per evitare riuso
      alternativeSlots: [],
    }

    await bookingRef.update(updateData)

    // Send confirmation email (non blocca se fallisce)
    try {
      const customerId = (bookingData.customerId || (bookingData as any).userId) as string | undefined
      if (customerId) {
        const customer = await getCustomerById(customerId)
        if (customer) {
          const updatedBooking: Booking = {
            id: bookingId,
            ...(bookingData as any),
            date: selectedSlot.date,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            status: "CONFIRMED",
            selectedAlternativeSlot: selectedSlot,
            alternativeSlots: [],
          } as Booking

          await sendBookingConfirmationEmail(updatedBooking, customer)
        }
      }
    } catch (emailError: any) {
      logger.error("Error sending confirmation email after alternative acceptance", {
        error: emailError?.message || emailError,
        bookingId,
      })
    }

    const duration = Date.now() - startTime
    logger.info("Alternative slot accepted", { bookingId, selectedSlot, duration })
    return { success: true }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error accepting alternative slot", {
      error: error.message || error,
      bookingId,
      duration,
    })
    return { success: false, error: "Errore durante l'accettazione dello slot alternativo. Riprova." }
  }
}

/**
 * Reject alternative slots (booking becomes rejected)
 */
export async function rejectAlternativeSlots(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()

  try {
    if (!bookingId) {
      return { success: false, error: "Booking ID is required" }
    }

    const adminDb = getAdminDb()
    const bookingRef = adminDb.collection("bookings").doc(bookingId)
    const bookingSnap = await bookingRef.get()

    if (!bookingSnap.exists) {
      logger.warn("Attempted to reject alternatives for non-existent booking", { bookingId })
      return { success: false, error: "Prenotazione non trovata" }
    }

    const bookingData = bookingSnap.data() as Partial<Booking> | undefined
    if (!bookingData) {
      logger.error("Booking snapshot exists but data is undefined", { bookingId })
      return { success: false, error: "Dati prenotazione non disponibili" }
    }

    if (bookingData.status !== "ALTERNATIVE_PROPOSED") {
      return { success: false, error: "La prenotazione non ha slot alternativi proposti" }
    }

    await bookingRef.update({
      status: "REJECTED",
      rejectionReason: "Cliente ha rifiutato gli slot alternativi proposti",
      updatedAt: new Date().toISOString(),
      alternativeSlots: [],
    } as any)

    const duration = Date.now() - startTime
    logger.info("Alternative slots rejected", { bookingId, duration })
    return { success: true }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error rejecting alternative slots", {
      error: error.message || error,
      bookingId,
      duration,
    })
    return { success: false, error: "Errore durante il rifiuto degli slot alternativi. Riprova." }
  }
}
