import { getAllCustomers } from "@/app/actions/customers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminAuthGuard } from "@/components/admin/auth-guard"
import { AdminLogoutButton } from "@/components/admin/logout-button"
import { ArrowLeft, Users, Search, Filter } from "lucide-react"
import Link from "next/link"
import { CustomersList } from "@/components/admin/customers-list"

export default async function CustomersPage() {
  const { customers } = await getAllCustomers(50)

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
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Gestione Clienti</h1>
              <p className="mt-2 text-lg text-gray-600">Visualizza e gestisci tutti i clienti registrati</p>
            </div>
            <AdminLogoutButton />
          </div>

          <Card className="border-2 border-gray-200 bg-white shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Lista Clienti
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 mt-2">
                    {customers.length} clienti totali
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CustomersList customers={customers} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthGuard>
  )
}

