"use server"

import { getAdminDb } from "@/lib/firebase-admin"
import type { Customer, Booking } from "@/types"
import { logger } from "@/lib/logger"
import { convertTimestamp } from "@/lib/firestore-utils"

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    const customerRef = adminDb.collection("customers").doc(customerId)
    const customerDoc = await customerRef.get()

    if (!customerDoc.exists) {
      logger.warn("Customer not found", { customerId })
      return null
    }

    const data = customerDoc.data()
    if (!data) {
      logger.warn("Customer data is undefined", { customerId })
      return null
    }

    const customer: Customer = {
      id: customerDoc.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      emailVerified: data.emailVerified || false,
      gender: data.gender,
      birthMonth: data.birthMonth,
      birthDay: data.birthDay,
      city: data.city,
      postalCode: data.postalCode,
      timePreference: data.timePreference,
      acquisitionChannel: data.acquisitionChannel,
      interests: data.interests || [],
      tags: data.tags || [],
      internalNotes: data.internalNotes,
      createdAt: convertTimestamp(data.createdAt) || new Date().toISOString(),
      updatedAt: convertTimestamp(data.updatedAt),
    }

    const duration = Date.now() - startTime
    logger.info("Customer fetched by ID", { customerId, duration })
    return customer
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching customer", { error: error.message || error, customerId, duration })
    return null
  }
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    const snapshot = await adminDb
      .collection("customers")
      .where("email", "==", email.toLowerCase().trim())
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    const customerDoc = snapshot.docs[0]
    const data = customerDoc.data()
    if (!data) {
      logger.warn("Customer data is undefined", { email })
      return null
    }

    const customer: Customer = {
      id: customerDoc.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      emailVerified: data.emailVerified || false,
      gender: data.gender,
      birthMonth: data.birthMonth,
      birthDay: data.birthDay,
      city: data.city,
      postalCode: data.postalCode,
      timePreference: data.timePreference,
      acquisitionChannel: data.acquisitionChannel,
      interests: data.interests || [],
      tags: data.tags || [],
      internalNotes: data.internalNotes,
      createdAt: convertTimestamp(data.createdAt) || new Date().toISOString(),
      updatedAt: convertTimestamp(data.updatedAt),
    }

    const duration = Date.now() - startTime
    logger.info("Customer fetched by email", { email, customerId: customer.id, duration })
    return customer
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching customer by email", { error: error.message || error, email, duration })
    return null
  }
}

/**
 * Get all customers with pagination
 */
export async function getAllCustomers(
  limitCount: number = 50,
  lastDocId?: string
): Promise<{ customers: Customer[]; hasMore: boolean; lastDocId?: string }> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    // Query without orderBy to avoid index requirement - we'll sort in memory
    let query = adminDb.collection("customers").limit(limitCount + 1)

    const snapshot = await query.get()
    const customers: Customer[] = []

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      if (!data) {
        logger.warn("Customer data is undefined, skipping", { docId: doc.id })
        return
      }
      customers.push({
        id: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        emailVerified: data.emailVerified || false,
        gender: data.gender,
        birthMonth: data.birthMonth,
        birthDay: data.birthDay,
        city: data.city,
        postalCode: data.postalCode,
        timePreference: data.timePreference,
        acquisitionChannel: data.acquisitionChannel,
        interests: data.interests || [],
        tags: data.tags || [],
        internalNotes: data.internalNotes,
        createdAt: convertTimestamp(data.createdAt) || new Date().toISOString(),
        updatedAt: convertTimestamp(data.updatedAt),
      })
    })

    // Sort in memory by createdAt descending
    customers.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0
      return b.createdAt.localeCompare(a.createdAt)
    })

    const hasMore = customers.length > limitCount
    const result = hasMore ? customers.slice(0, limitCount) : customers
    const lastDoc = hasMore ? snapshot.docs[limitCount - 1] : undefined

    const duration = Date.now() - startTime
    logger.info("Customers fetched", { count: result.length, hasMore, duration })
    return {
      customers: result,
      hasMore,
      lastDocId: lastDoc?.id,
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching customers", { error: error.message || error, duration })
    return { customers: [], hasMore: false }
  }
}

/**
 * Get customer bookings history
 */
export async function getCustomerBookings(customerId: string): Promise<Booking[]> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    // Query without orderBy to avoid index requirement - we'll sort in memory
    const snapshot = await adminDb
      .collection("bookings")
      .where("customerId", "==", customerId)
      .get()

    const bookings: Booking[] = []
    snapshot.docs.forEach((doc) => {
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
        customerId: data.customerId,
        serviceId: data.serviceId,
        salonId: data.salonId || "",
        rejectionReason: data.rejectionReason,
        alternativeSlots: data.alternativeSlots,
        selectedAlternativeSlot: data.selectedAlternativeSlot,
        serviceName: data.serviceName,
        servicePrice: data.servicePrice,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        createdAt: convertTimestamp(data.createdAt) || new Date().toISOString(),
        updatedAt: convertTimestamp(data.updatedAt),
        confirmedBy: data.confirmedBy,
        rejectedBy: data.rejectedBy,
      })
    })

    // Sort in memory by date descending, then by createdAt descending
    bookings.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date)
      }
      if (!a.createdAt || !b.createdAt) return 0
      return b.createdAt.localeCompare(a.createdAt)
    })

    const duration = Date.now() - startTime
    logger.info("Customer bookings fetched", { customerId, count: bookings.length, duration })
    return bookings
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching customer bookings", {
      error: error.message || error,
      customerId,
      duration,
    })
    return []
  }
}

/**
 * Update customer internal notes
 */
export async function updateCustomerNotes(
  customerId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    const customerRef = adminDb.collection("customers").doc(customerId)
    await customerRef.update({
      internalNotes: notes,
      updatedAt: new Date().toISOString(),
    })

    const duration = Date.now() - startTime
    logger.info("Customer notes updated", { customerId, duration })
    return { success: true }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error updating customer notes", {
      error: error.message || error,
      customerId,
      duration,
    })
    return { success: false, error: "Errore durante l'aggiornamento delle note" }
  }
}

/**
 * Auto-generate customer tags based on bookings and interests
 */
export async function updateCustomerTags(customerId: string): Promise<string[]> {
  try {
    const customer = await getCustomerById(customerId)
    if (!customer) {
      return []
    }

    const bookings = await getCustomerBookings(customerId)
    const tags: string[] = []

    // Tags based on services booked
    const serviceCounts = new Map<string, number>()
    bookings
      .filter((b) => b.status === "CONFIRMED")
      .forEach((booking) => {
        if (booking.serviceName) {
          serviceCounts.set(booking.serviceName, (serviceCounts.get(booking.serviceName) || 0) + 1)
        }
      })

    serviceCounts.forEach((count, serviceName) => {
      if (count >= 3) {
        tags.push(`${serviceName} ricorrente`)
      } else {
        tags.push(`Ha fatto ${serviceName}`)
      }
    })

    // Tags based on interests
    if (customer.interests && customer.interests.length > 0) {
      customer.interests.forEach((interest) => {
        tags.push(`Interessato: ${interest}`)
      })
    }

    // Tags based on time preference
    if (customer.timePreference) {
      tags.push(`Preferenza: ${customer.timePreference}`)
    }

    // Tags based on acquisition channel
    if (customer.acquisitionChannel) {
      tags.push(`Da: ${customer.acquisitionChannel}`)
    }

    // Tag for inactive customers (no bookings in last 60 days)
    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED")
    if (confirmedBookings.length > 0) {
      const lastBooking = confirmedBookings[0]
      const lastBookingDate = new Date(lastBooking.date)
      const daysSinceLastBooking = Math.floor(
        (Date.now() - lastBookingDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceLastBooking > 60) {
        tags.push("Cliente perso 60gg")
      } else if (daysSinceLastBooking > 30) {
        tags.push("Cliente inattivo")
      }
    }

    // Update customer with new tags
    const adminDb = getAdminDb()
    const customerRef = adminDb.collection("customers").doc(customerId)
    await customerRef.update({
      tags,
      updatedAt: new Date().toISOString(),
    })

    logger.info("Customer tags updated", { customerId, tags })
    return tags
  } catch (error: any) {
    logger.error("Error updating customer tags", { error: error.message || error, customerId })
    return []
  }
}

