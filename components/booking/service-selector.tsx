"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CheckIcon, ClockIcon, DollarSignIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Service } from "@/types"
import { getServices } from "@/app/actions/get-services"

interface ServiceSelectorProps {
  selected: Service | null
  onSelect: (service: Service) => void
}

export function ServiceSelector({ selected, onSelect }: ServiceSelectorProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServices()
        setServices(data)
      } catch (error) {
        console.error("[v0] Error loading services:", error)
      } finally {
        setLoading(false)
      }
    }
    loadServices()
  }, [])

  const getServiceImage = (serviceName: string) => {
    const name = serviceName.toLowerCase()
    if (name.includes("taglio") || name.includes("capelli")) {
      return "/hair-cutting-styling-salon-professional.jpg"
    } else if (name.includes("colore") || name.includes("tinta")) {
      return "/hair-coloring-salon-professional-beauty.jpg"
    } else if (name.includes("manicure") || name.includes("unghie")) {
      return "/manicure-nail-art-salon-luxury.jpg"
    } else if (name.includes("pedicure")) {
      return "/pedicure-spa-treatment-luxury.jpg"
    } else if (name.includes("massaggio") || name.includes("trattamento")) {
      return "/spa-massage-treatment-luxury-relaxing.jpg"
    }
    return "/beauty-salon-service-luxury-elegant.jpg"
  }
  // </CHANGE>

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center text-center">
        Nessun servizio disponibile al momento.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Scegli un servizio</h3>
      <div className="space-y-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={cn(
              "hover:border-primary focus-visible:border-ring focus-visible:ring-ring/50 group relative w-full rounded-xl border-2 p-5 text-left transition-all focus-visible:ring-[3px] focus-visible:outline-none overflow-hidden",
              selected?.id === service.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:bg-accent/50 hover:shadow-sm",
            )}
          >
            <div className="flex gap-4">
              <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={service.imageUrl || getServiceImage(service.name) || "/placeholder.svg"}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 items-start justify-between">
                {/* </CHANGE> */}
                <div className="flex-1">
                  <h4 className="font-semibold">{service.name}</h4>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="size-4" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <DollarSignIcon className="size-4" />
                      <span>${service.price}</span>
                    </div>
                  </div>
                </div>
                {selected?.id === service.id && (
                  <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full">
                    <CheckIcon className="size-4" />
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
