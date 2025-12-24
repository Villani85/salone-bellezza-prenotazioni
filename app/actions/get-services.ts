"use server"

import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import type { Service } from "@/types"
import { logger } from "@/lib/logger"
import { convertTimestamp } from "@/lib/firestore-utils"

export async function getActiveServices(salonId?: string): Promise<Service[]> {
  const startTime = Date.now()
  try {
    const servicesRef = collection(db, "services")
    // Query without orderBy to avoid index requirement - we'll sort in memory
    let q = query(servicesRef, where("active", "==", true))

    // If salonId provided, filter by salon
    if (salonId) {
      q = query(servicesRef, where("active", "==", true), where("salonId", "==", salonId))
    }

    const servicesSnapshot = await getDocs(q)

    const services: Service[] = []

    servicesSnapshot.forEach((doc) => {
      const data = doc.data()
      services.push({
        id: doc.id,
        name: data.name,
        category: data.category || "Altro",
        description: data.description,
        duration: data.duration,
        price: data.price,
        active: data.active,
        salonId: data.salonId,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      })
    })

    // Sort in memory by category, then by name
    services.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.name.localeCompare(b.name)
    })

    const duration = Date.now() - startTime
    logger.info("Active services fetched", { count: services.length, salonId, duration })
    return services
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching active services", { error: error.message || error, salonId, duration })
    return []
  }
}

export async function getAllServices(salonId?: string): Promise<Service[]> {
  const startTime = Date.now()
  try {
    const servicesRef = collection(db, "services")
    // Query without orderBy to avoid index requirement - we'll sort in memory
    let q = query(servicesRef)

    if (salonId) {
      q = query(servicesRef, where("salonId", "==", salonId))
    }

    const servicesSnapshot = await getDocs(q)

    const services: Service[] = []

    servicesSnapshot.forEach((doc) => {
      const data = doc.data()
      services.push({
        id: doc.id,
        name: data.name,
        category: data.category || "Altro",
        description: data.description,
        duration: data.duration,
        price: data.price,
        active: data.active,
        salonId: data.salonId,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      })
    })

    // Sort in memory by category, then by name
    services.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.name.localeCompare(b.name)
    })

    const duration = Date.now() - startTime
    logger.info("All services fetched", { count: services.length, salonId, duration })
    return services
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching all services", { error: error.message || error, salonId, duration })
    return []
  }
}

export const getServices = getActiveServices
