"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, User, Eye, EyeOff } from "lucide-react"
import { getAdminEmailByUsername } from "@/app/actions/admin-auth"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Check for error query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get("error")
    if (errorParam === "unauthorized") {
      setError("Accesso negato. Solo gli amministratori possono accedere.")
    } else if (errorParam === "error") {
      setError("Errore durante la verifica dell'autenticazione. Riprova.")
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Get email from username
      const email = await getAdminEmailByUsername(username)
      if (!email) {
        setError("Username o password non corretti")
        setLoading(false)
        return
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      // After successful login, verify admin status
      const { isAdmin } = await import("@/app/actions/admin-auth")
      const adminStatus = await isAdmin(userCredential.user.uid)
      
      if (!adminStatus) {
        await auth.signOut()
        setError("Accesso negato. Solo gli amministratori possono accedere.")
        return
      }
      
      router.push("/admin/dashboard")
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        setError("Username o password non corretti")
      } else if (err.code === "auth/too-many-requests") {
        setError("Troppi tentativi falliti. Riprova più tardi")
      } else if (err.code === "auth/user-not-found") {
        setError("Utente non trovato")
      } else if (err.code === "auth/wrong-password") {
        setError("Password errata")
      } else {
        setError(err.message || "Errore durante il login. Riprova")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-rose-50 p-4">
      <Card className="w-full max-w-md border-2 border-gray-200 bg-white shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-rose-500">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Admin Login</CardTitle>
          <CardDescription className="text-base text-gray-600">Accedi per gestire le prenotazioni</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10 border-2 border-gray-300 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 border-2 border-gray-300 focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-rose-500 text-white hover:from-purple-600 hover:to-rose-600 disabled:opacity-50 py-6 text-lg font-semibold"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
