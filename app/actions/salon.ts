"use server"

import { getAdminDb } from "@/lib/firebase-admin"
import type { Salon, SalonConfig } from "@/types"
import { logger } from "@/lib/logger"
import { convertTimestamp } from "@/lib/firestore-utils"

/**
 * Get salon by slug
 */
export async function getSalonBySlug(slug: string): Promise<Salon | null> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    const snapshot = await adminDb.collection("salons").where("slug", "==", slug).get()

    if (snapshot.empty) {
      logger.warn("Salon not found", { slug })
      return null
    }

    const salonDoc = snapshot.docs[0]
    const data = salonDoc.data()

    const salon: Salon = {
      id: salonDoc.id,
      name: data.name,
      slug: data.slug,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      publicLink: data.publicLink,
      config: data.config,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    }

    const duration = Date.now() - startTime
    logger.info("Salon fetched by slug", { slug, salonId: salon.id, duration })
    return salon
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching salon by slug", { error: error.message || error, slug, duration })
    return null
  }
}

/**
 * Get salon by ID
 */
export async function getSalonById(salonId: string): Promise<Salon | null> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    const salonRef = adminDb.collection("salons").doc(salonId)
    const salonDoc = await salonRef.get()

    if (!salonDoc.exists) {
      logger.warn("Salon not found", { salonId })
      return null
    }

    const data = salonDoc.data()
    const salon: Salon = {
      id: salonDoc.id,
      name: data.name,
      slug: data.slug,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      publicLink: data.publicLink,
      config: data.config,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    }

    const duration = Date.now() - startTime
    logger.info("Salon fetched by ID", { salonId, duration })
    return salon
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching salon by ID", { error: error.message || error, salonId, duration })
    return null
  }
}

/**
 * Get default salon (for backward compatibility - single salon mode)
 */
export async function getDefaultSalon(): Promise<Salon | null> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    const snapshot = await adminDb.collection("salons").get()

    if (snapshot.empty) {
      // Create default salon if none exists
      const defaultConfig: SalonConfig = {
        openingTime: "09:00",
        closingTime: "19:00",
        timeStep: 15,
        resources: 3,
        bufferTime: 10,
        closedDaysOfWeek: [],
        closedDates: [],
      }

      const defaultSalon: Omit<Salon, "id"> = {
        name: "Salone di Bellezza",
        slug: "default",
        email: "info@salone.it",
        publicLink: "/book/default",
        config: defaultConfig,
        createdAt: new Date().toISOString(),
      }

      const salonRef = adminDb.collection("salons").doc()
      await salonRef.set(defaultSalon)

      const salon: Salon = {
        id: salonRef.id,
        ...defaultSalon,
      }

      logger.info("Default salon created", { salonId: salon.id })
      return salon
    }

    // Return first salon found
    const salonDoc = snapshot.docs[0]
    const data = salonDoc.data()

    const salon: Salon = {
      id: salonDoc.id,
      name: data.name,
      slug: data.slug,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      publicLink: data.publicLink,
      config: data.config,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    }

    const duration = Date.now() - startTime
    logger.info("Default salon fetched", { salonId: salon.id, duration })
    return salon
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching default salon", { error: error.message || error, duration })
    return null
  }
}

/**
 * Update salon configuration
 */
export async function updateSalonConfig(
  salonId: string,
  updates: Partial<SalonConfig>
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    const salonRef = adminDb.collection("salons").doc(salonId)
    const salonDoc = await salonRef.get()

    if (!salonDoc.exists) {
      return { success: false, error: "Salone non trovato" }
    }

    const currentData = salonDoc.data()
    const currentConfig = currentData.config || {}

    const updatedConfig: SalonConfig = {
      ...currentConfig,
      ...updates,
    }

    await salonRef.update({
      config: updatedConfig,
      updatedAt: new Date().toISOString(),
    })

    const duration = Date.now() - startTime
    logger.info("Salon config updated", { salonId, updates, duration })
    return { success: true }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error updating salon config", {
      error: error.message || error,
      salonId,
      updates,
      duration,
    })
    return { success: false, error: "Errore durante l'aggiornamento della configurazione" }
  }
}

/**
 * Update salon info (name, contacts, etc.)
 */
export async function updateSalonInfo(
  salonId: string,
  updates: Partial<Pick<Salon, "name" | "email" | "phone" | "address" | "city">>
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    const adminDb = getAdminDb()
    const salonRef = adminDb.collection("salons").doc(salonId)
    const salonDoc = await salonRef.get()

    if (!salonDoc.exists) {
      return { success: false, error: "Salone non trovato" }
    }

    await salonRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    const duration = Date.now() - startTime
    logger.info("Salon info updated", { salonId, updates, duration })
    return { success: true }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error updating salon info", {
      error: error.message || error,
      salonId,
      updates,
      duration,
    })
    return { success: false, error: "Errore durante l'aggiornamento delle informazioni" }
  }
}

