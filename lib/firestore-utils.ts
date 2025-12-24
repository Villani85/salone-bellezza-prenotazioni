/**
 * Utility functions for Firestore data conversion
 */

import { Timestamp } from "firebase/firestore"

/**
 * Convert Firestore Timestamp to ISO string
 * Handles various timestamp formats from Firestore
 */
export function convertTimestamp(timestamp: any): string | undefined {
  if (!timestamp) return undefined
  
  // Firestore Timestamp object
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString()
  }
  
  // Timestamp with toDate method
  if (timestamp?.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toISOString()
  }
  
  // Timestamp with seconds property (from Admin SDK or plain object)
  if (timestamp?.seconds !== undefined) {
    const seconds = typeof timestamp.seconds === "number" ? timestamp.seconds : timestamp.seconds.toNumber?.() || 0
    const nanoseconds = timestamp.nanoseconds || 0
    return new Date(seconds * 1000 + nanoseconds / 1000000).toISOString()
  }
  
  // Already a string
  if (typeof timestamp === "string") {
    return timestamp
  }
  
  // Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }
  
  return undefined
}

