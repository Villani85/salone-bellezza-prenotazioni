import { getCustomerById, getCustomerBookings } from "@/app/actions/customers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminAuthGuard } from "@/components/admin/auth-guard"
import { AdminLogoutButton } from "@/components/admin/logout-button"
import { ArrowLeft, User, Mail, MapPin, Calendar, Clock, Tag, FileText } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { CustomerProfile } from "@/components/admin/customer-profile"
import { notFound } from "next/navigation"

interface CustomerPageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: CustomerPageProps) {
  const { id } = await params
  const [customer, bookings] = await Promise.all([getCustomerById(id), getCustomerBookings(id)])

  if (!customer) {
    notFound()
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-rose-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/customers">
                <Button variant="ghost" size="sm" className="mb-4 hover:bg-white/50">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna alla lista clienti
                </Button>
              </Link>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Profilo Cliente</h1>
            </div>
            <AdminLogoutButton />
          </div>

          <CustomerProfile customer={customer} bookings={bookings} />
        </div>
      </div>
    </AdminAuthGuard>
  )
}

