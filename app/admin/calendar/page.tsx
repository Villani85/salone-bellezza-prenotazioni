import { AdminAuthGuard } from "@/components/admin/auth-guard"
import { AdminLogoutButton } from "@/components/admin/logout-button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WeeklyCalendar } from "@/components/admin/weekly-calendar"
import { getAllBookingsForWeek } from "@/app/actions/get-all-bookings"
import { getDefaultSalon } from "@/app/actions/salon"
import { startOfWeek, endOfWeek, format } from "date-fns"

export default async function CalendarPage() {
  // Get bookings for current week
  const today = new Date()
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd")
  const bookings = await getAllBookingsForWeek(weekStart, weekEnd)
  const salon = await getDefaultSalon()
  const salonConfig = salon?.config

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="mb-4 hover:bg-white/50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna alla dashboard
                </Button>
              </Link>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Calendario Settimanale</h1>
              <p className="mt-2 text-lg text-gray-600">Visualizza tutte le prenotazioni in una vista settimanale</p>
            </div>
            <AdminLogoutButton />
          </div>

          <WeeklyCalendar bookings={bookings} salonConfig={salonConfig} />
        </div>
      </div>
    </AdminAuthGuard>
  )
}

