import { getPendingBookings, getTodayStats } from "@/app/actions/admin-bookings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingTable } from "@/components/admin/booking-table"
import { CalendarDays, Clock, CheckCircle, XCircle, ArrowLeft, Users, Settings, Calendar, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminAuthGuard } from "@/components/admin/auth-guard"
import { AdminLogoutButton } from "@/components/admin/logout-button"

export default async function AdminDashboard() {
  const [pendingBookings, stats] = await Promise.all([getPendingBookings(), getTodayStats()])

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-4 hover:bg-white/50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna alla home
                </Button>
              </Link>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard Admin</h1>
              <p className="mt-2 text-lg text-gray-600">Gestisci prenotazioni e visualizza statistiche</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Link href="/admin/calendar">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendario
                  </Button>
                </Link>
                <Link href="/admin/services">
                  <Button variant="outline" size="sm">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Servizi
                  </Button>
                </Link>
                <Link href="/admin/customers">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Clienti
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Impostazioni
                  </Button>
                </Link>
              </div>
            </div>
            <AdminLogoutButton />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Totale Oggi</CardTitle>
                <div className="rounded-lg bg-blue-100 p-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <p className="text-xs text-gray-500">Richieste di prenotazione oggi</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white transition-all hover:border-yellow-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">In Attesa</CardTitle>
                <div className="rounded-lg bg-yellow-100 p-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
                <p className="text-xs text-gray-500">In attesa di approvazione</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white transition-all hover:border-green-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Confermate</CardTitle>
                <div className="rounded-lg bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.confirmed}</div>
                <p className="text-xs text-gray-500">Prenotazioni approvate</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-white transition-all hover:border-red-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Rifiutate</CardTitle>
                <div className="rounded-lg bg-red-100 p-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.rejected}</div>
                <p className="text-xs text-gray-500">Rifiutate oggi</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-gray-200 bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Prenotazioni in Attesa</CardTitle>
              <CardDescription className="text-base text-gray-600">
                Rivedi e gestisci le richieste di prenotazione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingTable bookings={pendingBookings} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthGuard>
  )
}
