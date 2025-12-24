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

  // Check if date is in the past (allow today)
  const bookingDate = parse(date, "yyyy-MM-dd", new Date())
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  bookingDate.setHours(0, 0, 0, 0)

  if (isBefore(bookingDate, today)) {
    return { valid: false, error: "Cannot book appointments in the past" }
  }

  if (!userId || typeof userId !== "string") {
    return { valid: false, error: "User ID is required" }
  }

  return { valid: true }
}

/**
 * Check for conflicts with existing bookings (query + filter in memory)
 * (Nota: non è una vera transaction, ma va bene come double-check)
 */
async function checkConflictsInTransaction(
  date: string,
  startTime: string,
  endTime: string,
  bufferTime: number
): Promise<{ hasConflict: boolean; conflictCount: number }> {
  try {
    const adminDb = getAdminDb()

    const bookingsSnapshot = await adminDb
      .collection("bookings")
      .where("date", "==", date)
      .get()

    const existingBookings: Booking[] = bookingsSnapshot.docs
      .map((doc) => {
        const data = doc.data() as Partial<Booking>
        return { id: doc.id, ...data } as Booking
      })
      .filter((b) => b.status === "PENDING" || b.status === "CONFIRMED")

    const slotStart = parse(startTime, "HH:mm", new Date())
    const slotEnd = parse(endTime, "HH:mm", new Date())

    let conflictCount = 0

    for (const booking of existingBookings) {
      const bookingStart = parse(booking.startTime, "HH:mm", new Date())
      const bookingEnd = addMinutes(parse(booking.endTime, "HH:mm", new Date()), bufferTime)

      if (isBefore(slotStart, bookingEnd) && isBefore(bookingStart, slotEnd)) {
        conflictCount++
      }
    }

    return { hasConflict: conflictCount > 0, conflictCount }
  } catch (error: any) {
    logger.error("Error checking conflicts", { error: error?.message || error, date, startTime, endTime })
    return { hasConflict: true, conflictCount: Infinity }
  }
}

/**
 * Create a new booking with server-side validation and race-condition reduction
 */
export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const startMs = Date.now()

  try {
    // 1) Validate input
    const validation = validateBookingInput(input)
    if (!validation.valid) {
      logger.warn("Invalid booking input", { input, error: validation.error })
      return { success: false, error: validation.error }
    }

    const { serviceId, date, startTime: startTimeStr, userId } = input

    // 2) Fetch service
    const adminDb = getAdminDb()
    const serviceRef = adminDb.collection("services").doc(serviceId)
    const serviceSnap = await serviceRef.get()

    if (!serviceSnap.exists) {
      logger.warn("Service not found", { serviceId })
      return { success: false, error: "Il servizio selezionato non è disponibile." }
    }

    const service = serviceSnap.data() as Service | undefined
    if (!service) {
      logger.warn("Service data undefined", { serviceId })
      return { success: false, error: "Il servizio selezionato non è disponibile." }
    }

    if (!service.active) {
      logger.warn("Service is not active", { serviceId })
      return { success: false, error: "Il servizio selezionato non è attualmente disponibile." }
    }

    const serviceDuration = Number(service.duration ?? 0)
    if (!Number.isFinite(serviceDuration) || serviceDuration <= 0) {
      logger.warn("Invalid service duration in service data", { serviceId, duration: service.duration })
      return { success: false, error: "Durata servizio non valida. Contatta il salone." }
    }

    // 3) Fetch configuration
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
      ? ({ ...defaultConfig, ...(configSnap.data() as any) } as SalonConfig)
      : defaultConfig

    const bufferTime = Number(config.bufferTime ?? defaultConfig.bufferTime)
    const resources = Number(config.resources ?? defaultConfig.resources)

    // 4) Compute end time
    const startDate = parse(`${date} ${startTimeStr}`, "yyyy-MM-dd HH:mm", new Date())
    const endDate = addMinutes(startDate, serviceDuration)
    const endTime = format(endDate, "HH:mm")

    // 5) Validate time within opening hours
    const openingDateTime = parse(`${date} ${config.openingTime}`, "yyyy-MM-dd HH:mm", new Date())
    const closingDateTime = parse(`${date} ${config.closingTime}`, "yyyy-MM-dd HH:mm", new Date())

    if (isBefore(startDate, openingDateTime) || isAfter(endDate, closingDateTime)) {
      logger.warn("Booking outside opening hours", { startTime: startTimeStr, endTime, config })
      return { success: false, error: "L'orario selezionato è fuori dagli orari di apertura del salone." }
    }

    // 6) Re-validate availability
    const availableSlots = await getAvailableSlots(date, serviceDuration)
    if (!availableSlots.includes(startTimeStr)) {
      logger.warn("Slot no longer available (availability)", { date, startTime: startTimeStr })
      return {
        success: false,
        error: "Questo slot temporale non è più disponibile. Si prega di selezionare un altro orario.",
      }
    }

    // 7) Final conflict check (double-check)
    const bookingsSnapshot = await adminDb.collection("bookings").where("date", "==", date).get()

    const existingBookings: Booking[] = bookingsSnapshot.docs
      .map((doc) => {
        const data = doc.data() as Partial<Booking>
        return { id: doc.id, ...data } as Booking
      })
      .filter((b) => b.status === "PENDING" || b.status === "CONFIRMED")

    const slotStart = parse(startTimeStr, "HH:mm", new Date())
    const slotEnd = parse(endTime, "HH:mm", new Date())

    let conflictCount = 0
    for (const booking of existingBookings) {
      const bookingStart = parse(booking.startTime, "HH:mm", new Date())
      const bookingEnd = addMinutes(parse(booking.endTime, "HH:mm", new Date()), bufferTime)

      if (isBefore(slotStart, bookingEnd) && isBefore(bookingStart, slotEnd)) {
        conflictCount++
      }
    }

    if (conflictCount >= resources) {
      logger.warn("Slot conflict detected", { date, startTime: startTimeStr, conflictCount, resources })
      return {
        success: false,
        error: "Questo slot temporale non è più disponibile. Si prega di selezionare un altro orario.",
      }
    }

    // 8) Fetch customer data (safe)
    const customerRef = adminDb.collection("customers").doc(userId)
    const customerSnap = await customerRef.get()

    let customerName = ""
    let customerEmail = ""

    if (customerSnap.exists) {
      const customerData = customerSnap.data() as any | undefined
      if (customerData) {
        const first = customerData.firstName || ""
        const last = customerData.lastName || ""
        customerName = `${first} ${last}`.trim()
        customerEmail = customerData.email || ""
      }
    }

    // 9) Create booking
    const bookingData: Record<string, any> = {
      date,
      startTime: startTimeStr,
      endTime,
      status: "PENDING" as const,
      userId,
      customerId: userId,
      serviceId,
      serviceName: service.name || "",
      servicePrice: Number(service.price ?? 0),
      price: Number(service.price ?? 0),
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
    }

    const bookingRef = adminDb.collection("bookings").doc()
    await bookingRef.set(bookingData)

    const bookingId = bookingRef.id
    const duration = Date.now() - startMs

    logger.info("Booking created successfully", {
      bookingId,
      serviceId,
      date,
      startTime: startTimeStr,
      userId,
      duration,
    })

    return { success: true, id: bookingId }
  } catch (error: any) {
    const duration = Date.now() - startMs
    logger.error("Error creating booking", { error: error?.message || error, input, duration })

    // User-friendly errors
    const msg = String(error?.message || "")

    if (msg === "Service not found") {
      return { success: false, error: "Il servizio selezionato non è disponibile." }
    }

    if (msg === "Service is not available") {
      return { success: false, error: "Il servizio selezionato non è attualmente disponibile." }
    }

    if (msg.includes("time slot is no longer available")) {
      return {
        success: false,
        error: "Questo slot temporale non è più disponibile. Si prega di selezionare un altro orario.",
      }
    }

    if (msg.includes("outside opening hours")) {
      return { success: false, error: "L'orario selezionato è fuori dagli orari di apertura del salone." }
    }

    return {
      success: false,
      error: "Si è verificato un errore durante la creazione della prenotazione. Riprova più tardi.",
    }
  }
}
