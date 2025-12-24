import { AdminAuthGuard } from "@/components/admin/auth-guard"
import { AdminLogoutButton } from "@/components/admin/logout-button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ServicesManager } from "@/components/admin/services-manager"
import { getAllServices } from "@/app/actions/get-services"

export default async function ServicesPage() {
  const services = await getAllServices()

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
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Gestione Servizi</h1>
              <p className="mt-2 text-lg text-gray-600">Aggiungi, modifica ed elimina i servizi del salone</p>
            </div>
            <AdminLogoutButton />
          </div>

          <ServicesManager initialServices={services} />
        </div>
      </div>
    </AdminAuthGuard>
  )
}

