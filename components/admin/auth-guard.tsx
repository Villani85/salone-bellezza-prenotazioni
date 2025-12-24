"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Spinner } from "@/components/ui/spinner"
import { isAdmin } from "@/app/actions/admin-auth"

// Import logger for client-side logging
const logger = {
  warn: (message: string, context?: any) => console.warn(message, context),
  error: (message: string, context?: any) => console.error(message, context),
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        try {
          const adminStatus = await isAdmin(user.uid)
          if (adminStatus) {
            setAuthenticated(true)
            setIsAuthorized(true)
            setLoading(false)
          } else {
            // User is authenticated but not an admin
            logger.warn("Unauthorized admin access attempt", { userId: user.uid })
            router.push("/admin/login?error=unauthorized")
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          router.push("/admin/login?error=error")
        }
      } else {
        router.push("/admin/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-rose-50">
        <div className="text-center space-y-4">
          <Spinner className="h-12 w-12 mx-auto text-purple-500" />
          <p className="text-gray-600">Verifica autenticazione...</p>
        </div>
      </div>
    )
  }

  if (!authenticated || !isAuthorized) {
    return null
  }

  return <>{children}</>
}
