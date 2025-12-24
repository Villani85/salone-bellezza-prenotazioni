import { BookingWizard } from "@/components/booking/booking-wizard"
import { ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BookPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna alla home
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
                <User className="mr-2 h-4 w-4" />
                La mia area personale
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-gray-900">Prenota un appuntamento</h1>
            <p className="text-pretty mt-3 text-lg text-gray-600">
              Scegli il servizio, la data e l'orario per pianificare la tua visita
            </p>
          </div>
        </div>
        <BookingWizard />
      </div>
    </main>
  )
}
