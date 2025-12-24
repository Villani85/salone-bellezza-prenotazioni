"use server"

import { getAdminDb } from "@/lib/firebase-admin"
import type { Booking } from "@/types"
import { logger } from "@/lib/logger"
import { convertTimestamp } from "@/lib/firestore-utils"

/**
 * Get all bookings for a date range (for calendar view)
 */
export async function getAllBookingsForWeek(
  weekStart: string,
  weekEnd: string
): Promise<Booking[]> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    // Query without orderBy to avoid index requirement - we'll sort in memory
    const bookingsSnapshot = await adminDb
      .collection("bookings")
      .where("date", ">=", weekStart)
      .where("date", "<=", weekEnd)
      .get()

    const bookings: Booking[] = []
    bookingsSnapshot.docs.forEach((doc) => {
      const data = doc.data()
      bookings.push({
        id: doc.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        customerId: data.customerId || data.userId,
        serviceId: data.serviceId,
        salonId: data.salonId || "",
        rejectionReason: data.rejectionReason,
        alternativeSlots: data.alternativeSlots,
        selectedAlternativeSlot: data.selectedAlternativeSlot,
        serviceName: data.serviceName,
        servicePrice: data.servicePrice,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        confirmedBy: data.confirmedBy,
        rejectedBy: data.rejectedBy,
      })
    })

    // Sort in memory by date, then by startTime
    bookings.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date)
      }
      return a.startTime.localeCompare(b.startTime)
    })

    const duration = Date.now() - startTime
    logger.info("All bookings for week fetched", { weekStart, weekEnd, count: bookings.length, duration })
    return bookings
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching all bookings for week", {
      error: error.message || error,
      weekStart,
      weekEnd,
      duration,
    })
    return []
  }
}

