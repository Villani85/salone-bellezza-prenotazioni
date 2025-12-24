"use server"

import { auth } from "@/lib/firebase"
import { getAdminDb } from "@/lib/firebase-admin"
import { logger } from "@/lib/logger"

/**
 * Check if the current user is an admin
 * Admins are stored in the 'admins' collection with their Firebase UID as document ID
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false
    }

    const adminDb = getAdminDb()
    const adminRef = adminDb.collection("admins").doc(userId)
    const adminSnap = await adminRef.get()

    if (!adminSnap.exists) {
      logger.warn("User attempted to access admin area without permissions", { userId })
      return false
    }

    const adminData = adminSnap.data()
    return adminData?.active === true
  } catch (error) {
    logger.error("Error checking admin status", { error, userId })
    return false
  }
}

/**
 * Get admin email by username
 * Looks up username in adminUsers collection (document ID = username) or admins collection
 */
export async function getAdminEmailByUsername(username: string): Promise<string | null> {
  try {
    if (!username) {
      return null
    }

    const adminDb = getAdminDb()
    const normalizedUsername = username.toLowerCase().trim()
    
    // First, try to find in adminUsers collection (document ID = username)
    const adminUserRef = adminDb.collection("adminUsers").doc(normalizedUsername)
    const adminUserSnap = await adminUserRef.get()

    if (adminUserSnap.exists) {
      const userData = adminUserSnap.data()
      if (userData?.active === true && userData?.email) {
        return userData.email
      }
    }

    // Fallback: check if username is actually an email
    // This allows backward compatibility with email-based login
    if (username.includes("@")) {
      return username
    }

    return null
  } catch (error) {
    logger.error("Error getting admin email by username", { error, username })
    return null
  }
}

/**
 * Get current user ID from server-side auth
 * This is a placeholder - in a real app with Firebase Admin SDK,
 * you would extract the token from the request headers
 */
export async function getCurrentUserId(): Promise<string | null> {
  // Note: This is a simplified version. In production with Firebase Admin SDK,
  // you would verify the ID token from the Authorization header
  // For now, this will be handled client-side and passed to server actions
  return null
}

/**
 * Verify admin access - throws error if user is not admin
 */
export async function verifyAdminAccess(userId: string): Promise<void> {
  const hasAccess = await isAdmin(userId)
  if (!hasAccess) {
    logger.error("Unauthorized admin access attempt", { userId })
    throw new Error("Unauthorized: Admin access required")
  }
}

