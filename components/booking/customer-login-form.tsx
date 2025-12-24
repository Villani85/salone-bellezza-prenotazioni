"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircleIcon, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { getCustomerByEmail } from "@/app/actions/customers"
import Link from "next/link"

export function CustomerLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = searchParams?.get("redirect") || "/book"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Verify customer exists in Firestore
      const customer = await getCustomerByEmail(email)
      if (!customer) {
        await auth.signOut()
        setError("Account non trovato. Registrati per continuare.")
        setLoading(false)
        return
      }

      // Redirect to the specified page or booking page
      router.push(redirectTo)
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.code === "auth/invalid-credential") {
        setError("Email o password non corretti")
      } else if (err.code === "auth/user-not-found") {
        setError("Account non trovato. Registrati per continuare.")
      } else if (err.code === "auth/wrong-password") {
        setError("Password errata")
      } else if (err.code === "auth/too-many-requests") {
        setError("Troppi tentativi falliti. Riprova più tardi")
      } else {
        setError(err.message || "Errore durante il login. Riprova")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Accedi al tuo account</CardTitle>
        <CardDescription>Inserisci le tue credenziali per accedere</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircleIcon className="size-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10"
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

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Accesso in corso...
              </>
            ) : (
              "Accedi"
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Non hai un account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Registrati qui
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

