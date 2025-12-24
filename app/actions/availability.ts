"use server"

import { getAdminDb } from "@/lib/firebase-admin"
import { parse, format, addMinutes, isAfter, isBefore, isEqual } from "date-fns"
import type { SalonConfig, Booking } from "@/types"
import { logger } from "@/lib/logger"

interface TimeSlot {
  start: string
  end: string
}

/**
 * Get available time slots for a given date and service duration
 * @param date - Date in YYYY-MM-DD format
 * @param serviceDuration - Duration of the service in minutes
 * @returns Array of available time strings (e.g., ["09:00", "09:15"])
 */
export async function getAvailableSlots(date: string, serviceDuration: number): Promise<string[]> {
  const startTime = Date.now()

  try {
    // Validate inputs
    if (!Number.isFinite(serviceDuration) || serviceDuration <= 0) {
      logger.warn("Invalid service duration", { serviceDuration, date })
      return []
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      logger.error("Invalid date format", { date, serviceDuration })
      return []
    }

    // Check if date is in the past (allow today)
    const bookingDate = parse(date, "yyyy-MM-dd", new Date())
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    bookingDate.setHours(0, 0, 0, 0)

    if (isBefore(bookingDate, today)) {
      logger.warn("Attempted to get slots for past date", { date })
      return []
    }

    // 1) Day of week
    const dayOfWeek = bookingDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    // 2) Fetch salon configuration using Admin SDK
    const adminDb = getAdminDb()

    let config: SalonConfig | null = null

    // Try salons collection first (first salon as default)
    const salonsSnapshot = await adminDb.collection("salons").limit(1).get()
    if (!salonsSnapshot.empty) {
      const salonData: any = salonsSnapshot.docs[0].data()
      if (salonData?.config) {
        config = salonData.config as SalonConfig
      }
    }

    // Fallback to settings/config
    if (!config) {
      const configRef = adminDb.collection("settings").doc("config")
      const configSnap = await configRef.get()
      if (configSnap.exists) {
        config = configSnap.data() as SalonConfig
      }
    }

    // Default configuration
    const defaultConfig: SalonConfig = {
      openingTime: "09:00",
      closingTime: "19:00",
      timeStep: 15,
      resources: 3,
      bufferTime: 10,
      closedDaysOfWeek: [],
      closedDates: [],
    }

    const finalConfig: SalonConfig = config
      ? ({ ...defaultConfig, ...config } as SalonConfig)
      : defaultConfig

    // 3) Check if date is closed (specific date)
    if (finalConfig.closedDates?.includes(date)) {
      logger.info("Date is in closed dates", { date })
      return []
    }

    // 4) Check if day of week is closed
    if (finalConfig.closedDaysOfWeek?.includes(dayOfWeek)) {
      logger.info("Day of week is closed", { date, dayOfWeek })
      return []
    }

    const openingTime = finalConfig.openingTime || defaultConfig.openingTime
    const closingTime = finalConfig.closingTime || defaultConfig.closingTime
    const timeStep = Number(finalConfig.timeStep ?? defaultConfig.timeStep)
    const resources = Number(finalConfig.resources ?? defaultConfig.resources)
    const bufferTime = Number(finalConfig.bufferTime ?? defaultConfig.bufferTime)

    // 5) Fetch all bookings for the requested date
    const bookingsSnapshot = await adminDb
      .collection("bookings")
      .where("date", "==", date)
      .get()

    // ✅ Tipizzazione corretta: doc.data() -> Partial<Booking> e poi cast a Booking
    // + filtro solo PENDING/CONFIRMED
    const existingBookings: Booking[] = bookingsSnapshot.docs
      .map((doc) => {
        const data = doc.data() as Partial<Booking>
        return {
          id: doc.id,
          ...data,
        } as Booking
      })
      .filter((booking) => booking.status === "PENDING" || booking.status === "CONFIRMED")

    // 6) Parse opening and closing times using booking date as base
    const openingDateTime = parse(`${date} ${openingTime}`, "yyyy-MM-dd HH:mm", new Date())
    const closingDateTime = parse(`${date} ${closingTime}`, "yyyy-MM-dd HH:mm", new Date())

    // 7) Generate all potential time slots
    const availableSlots: string[] = []
    let currentSlot = openingDateTime

    while (isBefore(currentSlot, closingDateTime) || isEqual(currentSlot, closingDateTime)) {
      const slotStartTime = format(currentSlot, "HH:mm")

      // New booking range: [start, start + serviceDuration + bufferTime]
      const potentialEndTime = addMinutes(currentSlot, serviceDuration + bufferTime)
      const slotEndTime = format(potentialEndTime, "HH:mm")

      // Check if slot end time exceeds closing time
      if (isAfter(potentialEndTime, closingDateTime)) {
        break
      }

      // 8) Check for conflicts with existing bookings (buffer included)
      const conflicts = countConflicts(
        { start: slotStartTime, end: slotEndTime },
        existingBookings,
        bufferTime
      )

      // 9) If conflicts < resources, the slot is available
      if (conflicts < resources) {
        availableSlots.push(slotStartTime)
      }

      // Move to next time step
      currentSlot = addMinutes(currentSlot, timeStep)
    }

    const duration = Date.now() - startTime
    logger.info("Available slots fetched", {
      date,
      serviceDuration,
      slotsCount: availableSlots.length,
      duration,
    })
    return availableSlots
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching available slots", {
      error: error.message || error,
      date,
      serviceDuration,
      duration,
    })
    return []
  }
}

/**
 * Count how many existing bookings overlap with a given time slot
 * Now includes buffer time for existing bookings
 * @param slot - The time slot to check (already includes buffer)
 * @param bookings - Array of existing bookings
 * @param bufferTime - Buffer time in minutes to add to existing bookings
 * @returns Number of conflicting bookings
 */
function countConflicts(slot: TimeSlot, bookings: Booking[], bufferTime: number): number {
  return bookings.filter((booking) => {
    // Parse booking times and add buffer to existing booking end time
    const bookingStart = parse(booking.startTime, "HH:mm", new Date())
    const bookingEnd = addMinutes(parse(booking.endTime, "HH:mm", new Date()), bufferTime)

    const slotStart = parse(slot.start, "HH:mm", new Date())
    const slotEnd = parse(slot.end, "HH:mm", new Date())

    // overlap: slotStart < bookingEnd && bookingStart < slotEnd
    return isBefore(slotStart, bookingEnd) && isBefore(bookingStart, slotEnd)
  }).length
}
