"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, MapPin, Search } from "lucide-react"
import type { Customer } from "@/types"

interface CustomersListProps {
  customers: Customer[]
}

export function CustomersList({ customers: initialCustomers }: CustomersListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = initialCustomers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      (customer.city && customer.city.toLowerCase().includes(searchLower))
    )
  })

  const getStatusBadge = (customer: Customer) => {
    if (customer.tags?.some((tag) => tag.includes("perso 60gg"))) {
      return <Badge variant="destructive" className="text-xs">Inattivo</Badge>
    }
    if (customer.tags?.some((tag) => tag.includes("ricorrente"))) {
      return <Badge variant="default" className="text-xs bg-green-500">Frequente</Badge>
    }
    return <Badge variant="outline" className="text-xs">Nuovo</Badge>
  }

  if (initialCustomers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Nessun cliente registrato</h3>
        <p className="text-sm text-muted-foreground">I clienti appariranno qui dopo la registrazione</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca per nome, email o città..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Contatti</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Info</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Tag</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Registrato</th>
              <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </p>
                      {getStatusBadge(customer)}
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{customer.email}</span>
                    </div>
                    {customer.city && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{customer.city}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {customer.gender && <span>Genere: {customer.gender}</span>}
                    {customer.timePreference && <span>Preferenza: {customer.timePreference}</span>}
                    {customer.acquisitionChannel && <span>Canale: {customer.acquisitionChannel}</span>}
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-1">
                    {customer.tags && customer.tags.length > 0 ? (
                      customer.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Nessun tag</span>
                    )}
                    {customer.tags && customer.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{customer.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-4">
                  {customer.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(customer.createdAt), "dd MMM yyyy", { locale: it })}</span>
                    </div>
                  )}
                </td>
                <td className="py-4">
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/customers/${customer.id}`)}
                    >
                      Dettagli
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">
                    {customer.firstName} {customer.lastName}
                  </p>
                  {getStatusBadge(customer)}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{customer.email}</span>
              </div>
              {customer.city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{customer.city}</span>
                </div>
              )}
              {customer.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Registrato: {format(new Date(customer.createdAt), "dd MMM yyyy", { locale: it })}</span>
                </div>
              )}
            </div>

            {customer.tags && customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {customer.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {customer.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{customer.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/admin/customers/${customer.id}`)}
            >
              Visualizza Dettagli
            </Button>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nessun cliente trovato con i criteri di ricerca</p>
        </div>
      )}
    </div>
  )
}

