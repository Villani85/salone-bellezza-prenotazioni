"use server"

import { getAdminDb } from "@/lib/firebase-admin"
import { auth } from "@/lib/firebase"
import type { Customer, Gender, TimePreference, AcquisitionChannel } from "@/types"
import { logger } from "@/lib/logger"
import { convertTimestamp } from "@/lib/firestore-utils"

export interface RegisterCustomerInput {
  firstName: string
  lastName: string
  email: string
  confirmEmail: string
  password: string
  gender: Gender
  // Optional fields
  birthMonth?: number
  birthDay?: number
  city?: string
  postalCode?: string
  timePreference?: TimePreference
  acquisitionChannel?: AcquisitionChannel
  interests?: string[]
}

export interface RegisterCustomerResult {
  success: boolean
  customerId?: string
  error?: string
}

/**
 * Register a new customer
 */
export async function registerCustomer(input: RegisterCustomerInput): Promise<RegisterCustomerResult> {
  const startTime = Date.now()
  try {
    // Validate input
    if (!input.firstName || input.firstName.trim().length === 0) {
      return { success: false, error: "Il nome è obbligatorio." }
    }

    if (!input.lastName || input.lastName.trim().length === 0) {
      return { success: false, error: "Il cognome è obbligatorio." }
    }

    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      return { success: false, error: "Email non valida." }
    }

    if (input.email !== input.confirmEmail) {
      return { success: false, error: "Le email non corrispondono." }
    }

    if (!input.password || input.password.length < 6) {
      return { success: false, error: "La password deve essere di almeno 6 caratteri." }
    }

    if (!input.gender) {
      return { success: false, error: "Il genere è obbligatorio." }
    }

    const adminDb = getAdminDb()

    // Check if customer already exists
    const existingCustomer = await adminDb
      .collection("customers")
      .where("email", "==", input.email.toLowerCase().trim())
      .limit(1)
      .get()

    if (!existingCustomer.empty) {
      return { success: false, error: "Un account con questa email esiste già. Effettua il login." }
    }

    // Note: Firebase Auth user creation is done client-side
    // This function creates the customer record in Firestore
    // The client will pass the firebaseUserId after creating the auth user

    // Generate customer ID (will be set by Firestore)
    const customerData: Omit<Customer, "id"> = {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.toLowerCase().trim(),
      emailVerified: false, // Will be verified via email link
      gender: input.gender,
      birthMonth: input.birthMonth,
      birthDay: input.birthDay,
      city: input.city?.trim(),
      postalCode: input.postalCode?.trim(),
      timePreference: input.timePreference,
      acquisitionChannel: input.acquisitionChannel,
      interests: input.interests || [],
      tags: [], // Will be auto-generated
      createdAt: new Date().toISOString(),
    }

    // Create customer document
    const customerRef = adminDb.collection("customers").doc()
    await customerRef.set(customerData)

    const duration = Date.now() - startTime
    logger.info("Customer registered", { customerId: customerRef.id, email: input.email, duration })

    return { success: true, customerId: customerRef.id }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error registering customer", { error: error.message || error, input: { ...input, password: "***" }, duration })
    return { success: false, error: "Errore durante la registrazione. Riprova più tardi." }
  }
}

/**
 * Link Firebase Auth user to customer document
 */
export async function linkFirebaseUserToCustomer(
  customerId: string,
  firebaseUserId: string
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    await adminDb.collection("customers").doc(customerId).update({
      firebaseUserId,
    })

    const duration = Date.now() - startTime
    logger.info("Firebase user linked to customer", { customerId, firebaseUserId, duration })
    return { success: true }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error linking Firebase user to customer", {
      error: error.message || error,
      customerId,
      firebaseUserId,
      duration,
    })
    return { success: false, error: "Errore durante il collegamento dell'account" }
  }
}

/**
 * Get current customer from session/auth
 */
export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    // This would get the customer from the authenticated session
    // For now, we'll need to pass customerId from client
    return null
  } catch (error) {
    logger.error("Error getting current customer", { error })
    return null
  }
}

