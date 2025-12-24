"use server"

import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import type { Booking } from "@/types"
import { logger } from "@/lib/logger"
import { convertTimestamp } from "@/lib/firestore-utils"

export async function getBookingsByDate(date: string): Promise<Booking[]> {
  const startTime = Date.now()
  try {
    // Validate date format
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      logger.warn("Invalid date format in getBookingsByDate", { date })
      return []
    }

    const bookingsRef = collection(db, "bookings")
    const q = query(bookingsRef, where("date", "==", date))
    const bookingsSnapshot = await getDocs(q)

    const bookings: Booking[] = []

    bookingsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (!data) {
        logger.warn("Booking data is undefined, skipping", { docId: doc.id })
        return
      }
      bookings.push({
        id: doc.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        customerId: data.customerId || data.userId || "",
        serviceId: data.serviceId,
        salonId: data.salonId || "",
        createdAt: convertTimestamp(data.createdAt) || new Date().toISOString(),
        updatedAt: convertTimestamp(data.updatedAt),
      })
    })

    const duration = Date.now() - startTime
    logger.info("Bookings by date fetched", { date, count: bookings.length, duration })
    return bookings
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching bookings by date", { error: error.message || error, date, duration })
    return []
  }
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  const startTime = Date.now()
  try {
    if (!userId) {
      logger.warn("Empty userId in getBookingsByUser")
      return []
    }

    const bookingsRef = collection(db, "bookings")
    // Support both customerId and userId for backward compatibility
    const q = query(
      bookingsRef,
      where("customerId", "==", userId),
      orderBy("date", "desc")
    )
    const bookingsSnapshot = await getDocs(q)

    const bookings: Booking[] = []

    bookingsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (!data) {
        logger.warn("Booking data is undefined, skipping", { docId: doc.id })
        return
      }
      bookings.push({
        id: doc.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        customerId: data.customerId || data.userId || "",
        serviceId: data.serviceId,
        salonId: data.salonId || "",
        createdAt: convertTimestamp(data.createdAt) || new Date().toISOString(),
        updatedAt: convertTimestamp(data.updatedAt),
      })
    })

    const duration = Date.now() - startTime
    logger.info("Bookings by user fetched", { userId, count: bookings.length, duration })
    return bookings
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching user bookings", { error: error.message || error, userId, duration })
    return []
  }
}
