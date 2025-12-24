"use client"

import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function AdminLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/admin/login")
    } catch (error) {
      console.error("Errore durante il logout:", error)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 bg-transparent"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Esci
    </Button>
  )
}
