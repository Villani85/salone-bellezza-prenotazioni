"use server"

import { getAdminDb } from "@/lib/firebase-admin"
import type { Service, ServiceCategory } from "@/types"
import { logger } from "@/lib/logger"
import { convertTimestamp } from "@/lib/firestore-utils"

export interface CreateServiceInput {
  name: string
  category: ServiceCategory
  description?: string
  duration: number
  price: number
  active?: boolean
  imageUrl?: string
  salonId?: string
}

export interface UpdateServiceInput {
  name?: string
  category?: ServiceCategory
  description?: string
  duration?: number
  price?: number
  active?: boolean
  imageUrl?: string
}

export interface ServiceResult {
  success: boolean
  serviceId?: string
  error?: string
}

/**
 * Create a new service
 */
export async function createService(input: CreateServiceInput): Promise<ServiceResult> {
  const startTime = Date.now()
  try {
    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: "Il nome del servizio è obbligatorio." }
    }

    if (input.duration <= 0) {
      return { success: false, error: "La durata deve essere maggiore di zero." }
    }

    if (input.price < 0) {
      return { success: false, error: "Il prezzo non può essere negativo." }
    }

    const adminDb = getAdminDb()
    const serviceData = {
      name: input.name.trim(),
      category: input.category || "Altro",
      description: input.description?.trim() || "",
      duration: input.duration,
      price: input.price,
      active: input.active !== undefined ? input.active : true,
      imageUrl: input.imageUrl || null,
      salonId: input.salonId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = adminDb.collection("services").doc()
    await docRef.set(serviceData)

    const duration = Date.now() - startTime
    logger.info("Service created", { serviceId: docRef.id, name: input.name, duration })

    return { success: true, serviceId: docRef.id }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error creating service", { error: error.message || error, input, duration })
    return { success: false, error: "Errore durante la creazione del servizio." }
  }
}

/**
 * Update an existing service
 */
export async function updateService(serviceId: string, input: UpdateServiceInput): Promise<ServiceResult> {
  const startTime = Date.now()
  try {
    if (!serviceId) {
      return { success: false, error: "ID servizio non valido." }
    }

    const adminDb = getAdminDb()
    const serviceRef = adminDb.collection("services").doc(serviceId)
    const serviceSnap = await serviceRef.get()

    if (!serviceSnap.exists) {
      return { success: false, error: "Servizio non trovato." }
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    }

    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        return { success: false, error: "Il nome del servizio non può essere vuoto." }
      }
      updates.name = input.name.trim()
    }

    if (input.category !== undefined) {
      updates.category = input.category
    }

    if (input.description !== undefined) {
      updates.description = input.description.trim()
    }

    if (input.duration !== undefined) {
      if (input.duration <= 0) {
        return { success: false, error: "La durata deve essere maggiore di zero." }
      }
      updates.duration = input.duration
    }

    if (input.price !== undefined) {
      if (input.price < 0) {
        return { success: false, error: "Il prezzo non può essere negativo." }
      }
      updates.price = input.price
    }

    if (input.active !== undefined) {
      updates.active = input.active
    }

    if (input.imageUrl !== undefined) {
      updates.imageUrl = input.imageUrl || null
    }

    await serviceRef.update(updates)

    const duration = Date.now() - startTime
    logger.info("Service updated", { serviceId, updates, duration })

    return { success: true, serviceId }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error updating service", { error: error.message || error, serviceId, input, duration })
    return { success: false, error: "Errore durante l'aggiornamento del servizio." }
  }
}

/**
 * Delete a service
 */
export async function deleteService(serviceId: string): Promise<ServiceResult> {
  const startTime = Date.now()
  try {
    if (!serviceId) {
      return { success: false, error: "ID servizio non valido." }
    }

    const adminDb = getAdminDb()
    const serviceRef = adminDb.collection("services").doc(serviceId)
    const serviceSnap = await serviceRef.get()

    if (!serviceSnap.exists) {
      return { success: false, error: "Servizio non trovato." }
    }

    await serviceRef.delete()

    const duration = Date.now() - startTime
    logger.info("Service deleted", { serviceId, duration })

    return { success: true, serviceId }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error deleting service", { error: error.message || error, serviceId, duration })
    return { success: false, error: "Errore durante l'eliminazione del servizio." }
  }
}

