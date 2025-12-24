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
    if (serviceDuration <= 0) {
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

    // 1. Check if date is a closed day (weekday or specific date)
    const dayOfWeek = bookingDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    // 2. Fetch salon configuration using Admin SDK
    const adminDb = getAdminDb()
    
    // Try to get default salon first
    let config: SalonConfig | null = null
    
    // Get default salon
    const salonsSnapshot = await adminDb.collection("salons").limit(1).get()
    if (!salonsSnapshot.empty) {
      const salonData = salonsSnapshot.docs[0].data()
      if (salonData.config) {
        config = salonData.config as SalonConfig
      }
    }
    
    // Fallback to settings/config if no salon config found
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

    // 3. Check if date is closed (specific date)
    if (finalConfig.closedDates && finalConfig.closedDates.includes(date)) {
      logger.info("Date is in closed dates", { date })
      return []
    }

    // 4. Check if day of week is closed
    if (finalConfig.closedDaysOfWeek && finalConfig.closedDaysOfWeek.includes(dayOfWeek)) {
      logger.info("Day of week is closed", { date, dayOfWeek })
      return []
    }

    const { openingTime, closingTime, timeStep, resources, bufferTime } = finalConfig

    // 2. Fetch all PENDING and CONFIRMED bookings for the requested date using Admin SDK
    const bookingsSnapshot = await adminDb
      .collection("bookings")
      .where("date", "==", date)
      .get()
    
    // Filter in memory for PENDING and CONFIRMED status
    const existingBookings: Booking[] = bookingsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((booking) => booking.status === "PENDING" || booking.status === "CONFIRMED") as Booking[]

    // 3. Parse opening and closing times
    // Use the booking date as base for parsing times
    const openingDateTime = parse(`${date} ${openingTime}`, "yyyy-MM-dd HH:mm", new Date())
    const closingDateTime = parse(`${date} ${closingTime}`, "yyyy-MM-dd HH:mm", new Date())

    // 4. Generate all potential time slots
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

      // 5. Check for conflicts with existing bookings
      const conflicts = countConflicts({ start: slotStartTime, end: slotEndTime }, existingBookings, bufferTime)

      // 6. If conflicts < resources, the slot is available
      if (conflicts < resources) {
        availableSlots.push(slotStartTime)
      }

      // Move to next time step
      currentSlot = addMinutes(currentSlot, timeStep)
    }

    const duration = Date.now() - startTime
    logger.info("Available slots fetched", { date, serviceDuration, slotsCount: availableSlots.length, duration })
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

    return isBefore(slotStart, bookingEnd) && isBefore(bookingStart, slotEnd)
  }).length
}
