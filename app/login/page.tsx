import { CustomerLoginForm } from "@/components/booking/customer-login-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

function LoginFormWrapper() {
  return <CustomerLoginForm />
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-white/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla home
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-gray-900">Accedi</h1>
            <p className="text-pretty mt-3 text-lg text-gray-600">
              Accedi al tuo account per prenotare i servizi del salone
            </p>
          </div>
        </div>
        <Suspense fallback={<div>Caricamento...</div>}>
          <LoginFormWrapper />
        </Suspense>
      </div>
    </main>
  )
}

