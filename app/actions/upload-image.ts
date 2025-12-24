"use client"

import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"

export interface UploadImageResult {
  success: boolean
  imageUrl?: string
  error?: string
}

/**
 * Upload an image to Firebase Storage and return the public URL
 * This is a client-side function that uploads directly to Firebase Storage
 */
export async function uploadServiceImage(file: File): Promise<UploadImageResult> {
  try {
    if (!file) {
      return { success: false, error: "File immagine mancante." }
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Il file deve essere un'immagine." }
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "L'immagine deve essere inferiore a 5MB." }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const storagePath = `services/${timestamp}_${sanitizedFileName}`

    // Create storage reference
    const storageRef = ref(storage, storagePath)

    // Upload file
    const snapshot = await uploadBytes(storageRef, file)

    // Get download URL
    const imageUrl = await getDownloadURL(snapshot.ref)

    return { success: true, imageUrl }
  } catch (error: any) {
    console.error("Error uploading image:", error)
    return { success: false, error: "Errore durante il caricamento dell'immagine." }
  }
}

