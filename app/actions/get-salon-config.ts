"use server"

import { getDefaultSalon } from "./salon"
import type { SalonConfig } from "@/types"

/**
 * Get salon configuration for client-side use
 */
export async function getSalonConfigForClient(): Promise<SalonConfig | null> {
  try {
    const salon = await getDefaultSalon()
    return salon?.config || null
  } catch (error) {
    return null
  }
}

