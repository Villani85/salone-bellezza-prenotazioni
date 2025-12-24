/**
 * Firebase Admin SDK initialization for server-side operations
 * This bypasses Firestore security rules and allows server actions to read/write data
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

let adminApp: App | null = null
let adminDb: ReturnType<typeof getFirestore> | null = null

export function getAdminDb() {
  if (adminDb) {
    return adminDb
  }

  // Check if already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    adminApp = existingApps[0]
    adminDb = getFirestore(adminApp)
    return adminDb
  }

  // Initialize with service account credentials from environment
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials missing. Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
    )
  }

  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })

    adminDb = getFirestore(adminApp)
    return adminDb
  } catch (error: any) {
    console.error("Error initializing Firebase Admin:", error)
    throw new Error(`Failed to initialize Firebase Admin: ${error.message}`)
  }
}

