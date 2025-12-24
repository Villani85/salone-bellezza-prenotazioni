"use server"

import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { SalonConfig } from "@/types"
import { logger } from "@/lib/logger"

export async function getSalonConfig(): Promise<SalonConfig | null> {
  const startTime = Date.now()
  try {
    const configRef = doc(db, "settings", "config")
    const configDoc = await getDoc(configRef)

    if (!configDoc.exists()) {
      logger.warn("Salon config document does not exist, using defaults")
      // Return default config instead of null
      return {
        openingTime: "09:00",
        closingTime: "19:00",
        timeStep: 15,
        resources: 3,
        bufferTime: 10,
      }
    }

    const data = configDoc.data()

    if (!data) {
      logger.warn("Salon config data is empty, using defaults")
      return {
        openingTime: "09:00",
        closingTime: "19:00",
        timeStep: 15,
        resources: 3,
        bufferTime: 10,
      }
    }

    const config: SalonConfig = {
      openingTime: data.openingTime || "09:00",
      closingTime: data.closingTime || "19:00",
      timeStep: data.timeStep || 15,
      resources: data.resources || 3,
      bufferTime: data.bufferTime || 10,
    }

    const duration = Date.now() - startTime
    logger.info("Salon config fetched", { config, duration })
    return config
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error fetching salon config", { error: error.message || error, duration })
    // Return default config on error
    return {
      openingTime: "09:00",
      closingTime: "19:00",
      timeStep: 15,
      resources: 3,
      bufferTime: 10,
    }
  }
}
