import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, LayoutDashboard, Clock, Users, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="absolute inset-0 opacity-10">
          <Image src="/luxury-beauty-salon-interior-elegant-modern.jpg" alt="Salone di bellezza" fill className="object-cover" priority />
        </div>
        {/* Fine aggiunta immagine hero del salone */}

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700">
              <Sparkles className="h-4 w-4" />
              Sistema di prenotazione intelligente
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Il tuo salone,
              <br />
              sempre organizzato
            </h1>
            <p className="text-pretty mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Prenota appuntamenti in modo semplice e veloce. Sistema intelligente di gestione calendario con
              rilevamento automatico delle disponibilità.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/book">
                <Button size="lg" className="h-12 px-8 text-base bg-rose-600 hover:bg-rose-700">
                  <Calendar className="mr-2 h-5 w-5" />
                  Prenota ora
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base border-2 border-gray-200 hover:bg-gray-50 bg-transparent"
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Area Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 bg-white">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative h-64 overflow-hidden rounded-2xl sm:col-span-2">
            <Image
              src="/luxury-beauty-salon-hair-styling-station-elegant.jpg"
              alt="Area styling"
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="relative h-64 overflow-hidden rounded-2xl">
            <Image
              src="/beauty-salon-manicure-station-luxury-modern.jpg"
              alt="Area manicure"
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="relative h-64 overflow-hidden rounded-2xl">
            <Image
              src="/beauty-salon-treatment-room-spa-elegant.jpg"
              alt="Sala trattamenti"
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="relative h-64 overflow-hidden rounded-2xl sm:col-span-2">
            <Image
              src="/beauty-salon-reception-area-luxury-modern-elegant.jpg"
              alt="Reception"
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>
      {/* Fine aggiunta sezione gallery del salone */}

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tutto ciò di cui hai bisogno
          </h2>
          <p className="text-pretty mt-4 text-lg text-gray-600">
            Funzionalità avanzate per gestire il tuo salone in modo professionale
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group relative overflow-hidden border-2 border-gray-200 bg-white transition-all hover:border-rose-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 transition-transform group-hover:scale-110">
                <Clock className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl text-gray-900">Pianificazione intelligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                Calcolo automatico della disponibilità basato su durata servizio, tempo di buffer e risorse parallele
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-gray-200 bg-white transition-all hover:border-rose-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 transition-transform group-hover:scale-110">
                <Users className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl text-gray-900">Multi-risorsa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                Supporto per più operatori o postazioni che lavorano simultaneamente
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-gray-200 bg-white transition-all hover:border-rose-300 hover:shadow-xl sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 transition-transform group-hover:scale-110">
                <Calendar className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl text-gray-900">Aggiornamenti in tempo reale</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                Disponibilità aggiornata istantaneamente quando le prenotazioni vengono confermate o rifiutate
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-purple-600 px-8 py-16 shadow-2xl sm:px-16">
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pronto a iniziare?
            </h2>
            <p className="text-pretty mx-auto mt-4 max-w-xl text-lg text-white/90">
              Prenota il tuo primo appuntamento oggi stesso e scopri quanto è semplice
            </p>
            <Link href="/book">
              <Button
                size="lg"
                variant="secondary"
                className="mt-8 h-12 px-8 text-base font-semibold bg-white text-rose-600 hover:bg-gray-50"
              >
                Prenota subito
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
