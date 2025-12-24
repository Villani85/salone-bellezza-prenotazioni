"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, LogIn } from "lucide-react"
import { getCustomerByEmail } from "@/app/actions/customers"
import Link from "next/link"

export function CustomerAccountGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify customer exists in Firestore
        try {
          const customer = await getCustomerByEmail(user.email || "")
          if (customer) {
            setAuthenticated(true)
            setCustomerId(customer.id)
            setLoading(false)
          } else {
            // User exists in Auth but not in customers collection
            await auth.signOut()
            setAuthenticated(false)
            setLoading(false)
          }
        } catch (error) {
          console.error("Error checking customer:", error)
          setAuthenticated(false)
          setLoading(false)
        }
      } else {
        setAuthenticated(false)
        setCustomerId(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="border-2 shadow-xl max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl mt-4">Accesso richiesto</CardTitle>
            <CardDescription className="text-base">
              Devi essere registrato per accedere alla tua area personale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Link href="/login?redirect=/account">
                <Button className="w-full" size="lg">
                  <LogIn className="mr-2 h-5 w-5" />
                  Accedi
                </Button>
              </Link>
              <Link href="/register?redirect=/account">
                <Button variant="outline" className="w-full" size="lg">
                  <User className="mr-2 h-5 w-5" />
                  Registrati
                </Button>
              </Link>
            </div>
            <p className="text-center text-sm text-gray-600">
              La registrazione è gratuita e richiede solo pochi minuti
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

