import { getDefaultSalon } from "@/app/actions/salon"
import { AdminAuthGuard } from "@/components/admin/auth-guard"
import { AdminLogoutButton } from "@/components/admin/logout-button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SalonSettings } from "@/components/admin/salon-settings"
import { notFound } from "next/navigation"

export default async function SettingsPage() {
  const salon = await getDefaultSalon()

  if (!salon) {
    notFound()
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="mb-4 hover:bg-white/50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna alla dashboard
                </Button>
              </Link>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Impostazioni Salone</h1>
              <p className="mt-2 text-lg text-gray-600">Configura le informazioni e le regole del salone</p>
            </div>
            <AdminLogoutButton />
          </div>

          <SalonSettings salon={salon} />
        </div>
      </div>
    </AdminAuthGuard>
  )
}

