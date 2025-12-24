"use server"

import { getAdminDb } from "@/lib/firebase-admin"
import type { Booking } from "@/types"
import { logger } from "@/lib/logger"
import { verifyAdminAccess } from "./admin-auth"
import { sendBookingConfirmationEmail, sendBookingRejectionEmail, sendAlternativeSlotsEmail } from "./email"
import { getCustomerById } from "./customers"

export interface BookingWithDetails extends Booking {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  serviceName: string
  servicePrice: number
}

export async function getPendingBookings(userId?: string): Promise<BookingWithDetails[]> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()

    // Query without orderBy to avoid index requirement - we'll sort in memory
    const bookingsSnapshot = await adminDb
      .collection("bookings")
      .where("status", "==", "PENDING")
      .get()

    const serviceCache = new Map<string, any>()
    const customerCache = new Map<string, any>()

    const bookingsWithDetails: BookingWithDetails[] = []

    for (const bookingDoc of bookingsSnapshot.docs) {
      const data = bookingDoc.data()

      let serviceData = serviceCache.get(data.serviceId)
      if (!serviceData) {
        const serviceDoc = await adminDb.collection("services").doc(data.serviceId).get()
        serviceData = serviceDoc.data()
        if (serviceData) {
          serviceCache.set(data.serviceId, serviceData)
        }
      }

      let customerName = "Anonymous"
      let customerEmail = ""
      let customerPhone = ""

      if (data.customerId && data.customerId !== "anonymous") {
        let customerData = customerCache.get(data.customerId)
        if (!customerData) {
          const customerDoc = await adminDb.collection("customers").doc(data.customerId).get()
          if (customerDoc.exists) {
            customerData = customerDoc.data()
            customerCache.set(data.customerId, customerData)
          }
        }
        if (customerData) {
          customerName = `${customerData.firstName || ""} ${customerData.lastName || ""}`.trim() || "Anonymous"
          customerEmail = customerData.email || ""
          customerPhone = customerData.phone || ""
        }
      }

      bookingsWithDetails.push({
        id: bookingDoc.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        customerId: data.customerId || data.userId,
        serviceId: data.serviceId,
        salonId: data.salonId || "",
        customerName,
        customerEmail,
        customerPhone,
        serviceName: serviceData?.name || "Unknown Service",
        servicePrice: serviceData?.price || 0,
      })
    }

    // Sort in memory by date, then by startTime
    bookingsWithDetails.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }
      return a.startTime.localeCompare(b.startTime)
    })

    const duration = Date.now() - startTime
    logger.info("Pending bookings fetched", { count: bookingsWithDetails.length, duration })
    return bookingsWithDetails
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching pending bookings", { error: error.message || error, duration })
    return []
  }
}

export async function getTodayStats(userId?: string): Promise<{ total: number; pending: number; confirmed: number; rejected: number }> {
  const startTime = Date.now()
  try {
    const today = new Date().toISOString().split("T")[0]
    const adminDb = getAdminDb()

    const bookingsSnapshot = await adminDb.collection("bookings").where("date", "==", today).get()

    let pending = 0
    let confirmed = 0
    let rejected = 0

    bookingsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.status === "PENDING") pending++
      if (data.status === "CONFIRMED") confirmed++
      if (data.status === "REJECTED") rejected++
    })

    const duration = Date.now() - startTime
    logger.info("Today stats fetched", { total: bookingsSnapshot.size, pending, confirmed, rejected, duration })
    return {
      total: bookingsSnapshot.size,
      pending,
      confirmed,
      rejected,
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching today's stats", { error: error.message || error, duration })
    return { total: 0, pending: 0, confirmed: 0, rejected: 0 }
  }
}

export async function approveBooking(id: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    if (!id) {
      return { success: false, error: "Booking ID is required" }
    }

    const adminDb = getAdminDb()

    // Verify booking exists
    const bookingRef = adminDb.collection("bookings").doc(id)
    const bookingSnap = await bookingRef.get()

    if (!bookingSnap.exists) {
      logger.warn("Attempted to approve non-existent booking", { bookingId: id, userId })
      return { success: false, error: "Booking not found" }
    }

    const bookingData = bookingSnap.data()
    if (bookingData?.status !== "PENDING" && bookingData?.status !== "ALTERNATIVE_PROPOSED") {
      logger.warn("Attempted to approve booking with invalid status", {
        bookingId: id,
        currentStatus: bookingData?.status,
        userId,
      })
      return { success: false, error: `Non è possibile approvare una prenotazione con stato ${bookingData?.status?.toLowerCase()}` }
    }

    await bookingRef.update({
      status: "CONFIRMED",
      updatedAt: new Date().toISOString(),
      confirmedBy: userId || "unknown",
    })

    // Send confirmation email
    try {
      const customer = await getCustomerById(bookingData?.customerId)
      if (customer) {
        const fullBooking: Booking = {
          id,
          ...bookingData,
          status: "CONFIRMED",
        } as Booking
        await sendBookingConfirmationEmail(fullBooking, customer)
      }
    } catch (emailError) {
      logger.error("Error sending confirmation email", { error: emailError, bookingId: id })
      // Don't fail the approval if email fails
    }

    const duration = Date.now() - startTime
    logger.info("Booking approved", { bookingId: id, userId, duration })
    return { success: true }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error approving booking", { error: error.message || error, bookingId: id, userId, duration })
    return { success: false, error: "Errore durante l'approvazione della prenotazione. Riprova." }
  }
}

export async function rejectBooking(
  id: string,
  userId?: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    if (!id) {
      return { success: false, error: "Booking ID is required" }
    }

    const adminDb = getAdminDb()

    // Verify booking exists
    const bookingRef = adminDb.collection("bookings").doc(id)
    const bookingSnap = await bookingRef.get()

    if (!bookingSnap.exists) {
      logger.warn("Attempted to reject non-existent booking", { bookingId: id, userId })
      return { success: false, error: "Booking not found" }
    }

    const bookingData = bookingSnap.data()
    if (bookingData?.status !== "PENDING" && bookingData?.status !== "ALTERNATIVE_PROPOSED") {
      logger.warn("Attempted to reject booking with invalid status", {
        bookingId: id,
        currentStatus: bookingData?.status,
        userId,
      })
      return { success: false, error: `Non è possibile rifiutare una prenotazione con stato ${bookingData?.status?.toLowerCase()}` }
    }

    const updateData: any = {
      status: "REJECTED",
      updatedAt: new Date().toISOString(),
      rejectedBy: userId || "unknown",
    }

    if (reason) {
      updateData.rejectionReason = reason
    }

    await bookingRef.update(updateData)

    const duration = Date.now() - startTime
    logger.info("Booking rejected", { bookingId: id, userId, reason, duration })
    return { success: true }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error rejecting booking", { error: error.message || error, bookingId: id, userId, duration })
    return { success: false, error: "Errore durante il rifiuto della prenotazione. Riprova." }
  }
}

/**
 * Propose alternative slots for a booking
 */
export async function proposeAlternatives(
  id: string,
  alternativeSlots: Array<{ date: string; startTime: string; endTime: string }>,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    if (!id) {
      return { success: false, error: "Booking ID is required" }
    }

    if (!alternativeSlots || alternativeSlots.length === 0) {
      return { success: false, error: "Almeno uno slot alternativo è richiesto" }
    }

    if (alternativeSlots.length > 3) {
      return { success: false, error: "Massimo 3 slot alternativi possono essere proposti" }
    }

    const adminDb = getAdminDb()

    // Verify booking exists
    const bookingRef = adminDb.collection("bookings").doc(id)
    const bookingSnap = await bookingRef.get()

    if (!bookingSnap.exists) {
      logger.warn("Attempted to propose alternatives for non-existent booking", { bookingId: id, userId })
      return { success: false, error: "Booking not found" }
    }

    const bookingData = bookingSnap.data()
    if (bookingData?.status !== "PENDING") {
      logger.warn("Attempted to propose alternatives for booking with invalid status", {
        bookingId: id,
        currentStatus: bookingData?.status,
        userId,
      })
      return { success: false, error: `Non è possibile proporre alternative per una prenotazione con stato ${bookingData?.status?.toLowerCase()}` }
    }

    await bookingRef.update({
      status: "ALTERNATIVE_PROPOSED",
      alternativeSlots,
      updatedAt: new Date().toISOString(),
      proposedBy: userId || "unknown",
    })

    // Send alternative slots email
    try {
      const customer = await getCustomerById(bookingData?.customerId)
      if (customer) {
        const fullBooking: Booking = {
          id,
          ...bookingData,
          status: "ALTERNATIVE_PROPOSED",
          alternativeSlots,
        } as Booking
        await sendAlternativeSlotsEmail(fullBooking, customer, alternativeSlots)
      }
    } catch (emailError) {
      logger.error("Error sending alternatives email", { error: emailError, bookingId: id })
      // Don't fail the proposal if email fails
    }

    const duration = Date.now() - startTime
    logger.info("Alternatives proposed", { bookingId: id, slotsCount: alternativeSlots.length, userId, duration })
    return { success: true }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error proposing alternatives", {
      error: error.message || error,
      bookingId: id,
      userId,
      duration,
    })
    return { success: false, error: "Errore durante la proposta di alternative. Riprova." }
  }
}
