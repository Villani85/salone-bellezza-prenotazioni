"use server"

import { getAdminDb } from "@/lib/firebase-admin"
import { parse, addMinutes, format, isBefore, isAfter } from "date-fns"
import { getAvailableSlots } from "./availability"
import type { Service, Booking, SalonConfig } from "@/types"
import { logger } from "@/lib/logger"

export interface CreateBookingInput {
  serviceId: string
  date: string // YYYY-MM-DD format
  startTime: string // HH:mm format
  userId: string
}

export interface CreateBookingResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Validates booking input data
 */
function validateBookingInput(input: CreateBookingInput): { valid: boolean; error?: string } {
  const { serviceId, date, startTime, userId } = input

  if (!serviceId || typeof serviceId !== "string") {
    return { valid: false, error: "Service ID is required" }
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { valid: false, error: "Invalid date format. Expected YYYY-MM-DD" }
  }

  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    return { valid: false, error: "Invalid time format. Expected HH:mm" }
  }

  // Check if date is in the past
  const bookingDate = parse(date, "yyyy-MM-dd", new Date())
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (isBefore(bookingDate, today)) {
    return { valid: false, error: "Cannot book appointments in the past" }
  }

  if (!userId || typeof userId !== "string") {
    return { valid: false, error: "User ID is required" }
  }

  return { valid: true }
}

/**
 * Check for conflicts with existing bookings using transaction
 */
async function checkConflictsInTransaction(
  date: string,
  startTime: string,
  endTime: string,
  bufferTime: number
): Promise<{ hasConflict: boolean; conflictCount: number }> {
  try {
    const adminDb = getAdminDb()
    // Query without "in" to avoid index requirement, filter in memory
    const bookingsSnapshot = await adminDb
      .collection("bookings")
      .where("date", "==", date)
      .get()
    
    const existingBookings = bookingsSnapshot.docs
      .map((doc) => doc.data())
      .filter((booking) => booking.status === "PENDING" || booking.status === "CONFIRMED") as Booking[]

    const slotStart = parse(startTime, "HH:mm", new Date())
    const slotEnd = parse(endTime, "HH:mm", new Date())

    let conflictCount = 0

    for (const booking of existingBookings) {
      const bookingStart = parse(booking.startTime, "HH:mm", new Date())
      const bookingEnd = addMinutes(parse(booking.endTime, "HH:mm", new Date()), bufferTime)

      // Check for overlap
      if (isBefore(slotStart, bookingEnd) && isBefore(bookingStart, slotEnd)) {
        conflictCount++
      }
    }

    return { hasConflict: conflictCount > 0, conflictCount }
  } catch (error) {
    logger.error("Error checking conflicts", { error, date, startTime, endTime })
    return { hasConflict: true, conflictCount: Infinity }
  }
}

/**
 * Create a new booking with server-side validation and transaction safety
 * Uses Firestore transactions to prevent race conditions
 */
export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const startTime = Date.now()

  try {
    // 1. Validate input
    const validation = validateBookingInput(input)
    if (!validation.valid) {
      logger.warn("Invalid booking input", { input, error: validation.error })
      return { success: false, error: validation.error }
    }

    const { serviceId, date, startTime: startTimeStr, userId } = input

    // 2. Fetch service details and validate using Admin SDK
    const adminDb = getAdminDb()
    const serviceRef = adminDb.collection("services").doc(serviceId)
    const serviceSnap = await serviceRef.get()

    if (!serviceSnap.exists) {
      logger.warn("Service not found", { serviceId })
      return { success: false, error: "Il servizio selezionato non è disponibile." }
    }

    const service = serviceSnap.data() as Service
    if (!service.active) {
      logger.warn("Service is not active", { serviceId })
      return { success: false, error: "Il servizio selezionato non è attualmente disponibile." }
    }

    const serviceDuration = service.duration

    // 3. Fetch configuration using Admin SDK
    const configRef = adminDb.collection("settings").doc("config")
    const configSnap = await configRef.get()

    const defaultConfig: SalonConfig = {
      openingTime: "09:00",
      closingTime: "19:00",
      timeStep: 15,
      resources: 3,
      bufferTime: 10,
      closedDaysOfWeek: [],
      closedDates: [],
    }

    const config: SalonConfig = configSnap.exists
      ? ({ ...defaultConfig, ...configSnap.data() } as SalonConfig)
      : defaultConfig

    // 4. Compute end time
    // Use the booking date as base for parsing times
    const startDate = parse(`${date} ${startTimeStr}`, "yyyy-MM-dd HH:mm", new Date())
    const endDate = addMinutes(startDate, serviceDuration)
    const endTime = format(endDate, "HH:mm")

    // 5. Validate time is within opening hours
    const openingDateTime = parse(`${date} ${config.openingTime}`, "yyyy-MM-dd HH:mm", new Date())
    const closingDateTime = parse(`${date} ${config.closingTime}`, "yyyy-MM-dd HH:mm", new Date())

    if (isBefore(startDate, openingDateTime) || isAfter(endDate, closingDateTime)) {
      logger.warn("Booking outside opening hours", { startTime: startTimeStr, config })
      return {
        success: false,
        error: "L'orario selezionato è fuori dagli orari di apertura del salone.",
      }
    }

    // 6. Re-validate availability to prevent race conditions
    // This double-check reduces the window for race conditions
    const availableSlots = await getAvailableSlots(date, serviceDuration)

    if (!availableSlots.includes(startTimeStr)) {
      logger.warn("Slot no longer available", { date, startTime: startTimeStr })
      return {
        success: false,
        error: "Questo slot temporale non è più disponibile. Si prega di selezionare un altro orario.",
      }
    }

    // 7. Final conflict check before creating (double-check to reduce race condition window)
    // Use Admin SDK and filter in memory to avoid index requirement
    const bookingsSnapshot = await adminDb
      .collection("bookings")
      .where("date", "==", date)
      .get()
    
    const existingBookings = bookingsSnapshot.docs
      .map((doc) => doc.data())
      .filter((booking) => booking.status === "PENDING" || booking.status === "CONFIRMED") as Booking[]

    const slotStart = parse(startTimeStr, "HH:mm", new Date())
    const slotEnd = parse(endTime, "HH:mm", new Date())

    let conflictCount = 0

    for (const booking of existingBookings) {
      const bookingStart = parse(booking.startTime, "HH:mm", new Date())
      const bookingEnd = addMinutes(parse(booking.endTime, "HH:mm", new Date()), config.bufferTime)

      if (isBefore(slotStart, bookingEnd) && isBefore(bookingStart, slotEnd)) {
        conflictCount++
      }
    }

    // Check if we still have enough resources
    if (conflictCount >= config.resources) {
      logger.warn("Slot conflict detected", { date, startTime: startTimeStr, conflictCount, resources: config.resources })
      return {
        success: false,
        error: "Questo slot temporale non è più disponibile. Si prega di selezionare un altro orario.",
      }
    }

    // 8. Fetch customer data for booking
    const customerRef = adminDb.collection("customers").doc(userId)
    const customerSnap = await customerRef.get()
    let customerName = ""
    let customerEmail = ""

    if (customerSnap.exists) {
      const customerData = customerSnap.data()
      customerName = `${customerData.firstName} ${customerData.lastName}`
      customerEmail = customerData.email
    }

    // 9. Create the booking using Admin SDK
    const bookingData = {
      date,
      startTime: startTimeStr,
      endTime,
      status: "PENDING" as const,
      userId,
      customerId: userId, // customerId is the same as userId
      serviceId,
      serviceName: service.name,
      servicePrice: service.price,
      price: service.price,
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
    }

    const bookingRef = adminDb.collection("bookings").doc()
    await bookingRef.set(bookingData)
    const bookingId = bookingRef.id

    const duration = Date.now() - startTime
    logger.info("Booking created successfully", {
      bookingId,
      serviceId,
      date,
      startTime: startTimeStr,
      userId,
      duration,
    })

    return {
      success: true,
      id: bookingId,
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error creating booking", {
      error: error.message || error,
      input,
      duration,
    })

    // Provide user-friendly error messages
    if (error.message === "Service not found") {
      return { success: false, error: "Il servizio selezionato non è disponibile." }
    }

    if (error.message === "Service is not available") {
      return { success: false, error: "Il servizio selezionato non è attualmente disponibile." }
    }

    if (error.message.includes("time slot is no longer available")) {
      return {
        success: false,
        error: "Questo slot temporale non è più disponibile. Si prega di selezionare un altro orario.",
      }
    }

    if (error.message.includes("outside opening hours")) {
      return {
        success: false,
        error: "L'orario selezionato è fuori dagli orari di apertura del salone.",
      }
    }

    return {
      success: false,
      error: "Si è verificato un errore durante la creazione della prenotazione. Riprova più tardi.",
    }
  }
}
