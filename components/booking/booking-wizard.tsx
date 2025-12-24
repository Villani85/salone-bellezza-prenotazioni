"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeftIcon, ChevronRightIcon, User } from "lucide-react"
import { ServiceSelector } from "./service-selector"
import { DateSelector } from "./date-selector"
import { SlotSelector } from "./slot-selector"
import { BookingSummary } from "./booking-summary"
import { CustomerAuthGuard } from "./customer-auth-guard"
import type { Service } from "@/types"

const STEPS = ["Seleziona Servizio", "Scegli Data", "Seleziona Orario", "Conferma"]

export function BookingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedService !== null
      case 1:
        return selectedDate !== undefined
      case 2:
        return selectedSlot !== null
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    // Don't reset, just redirect to account page
    // The booking summary will handle the redirect
  }

  return (
    <CustomerAuthGuard>
      <Card className="border-2 shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Passo {currentStep + 1} di {STEPS.length}
            </CardTitle>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {STEPS[currentStep]}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="min-h-[400px]">
          {currentStep === 0 && <ServiceSelector selected={selectedService} onSelect={setSelectedService} />}

          {currentStep === 1 && <DateSelector selected={selectedDate} onSelect={setSelectedDate} />}

          {currentStep === 2 && selectedService && selectedDate && (
            <SlotSelector
              date={selectedDate}
              serviceDuration={selectedService.duration}
              selected={selectedSlot}
              onSelect={setSelectedSlot}
            />
          )}

          {currentStep === 3 && selectedService && selectedDate && selectedSlot && (
            <BookingSummary service={selectedService} date={selectedDate} slot={selectedSlot} onSuccess={handleReset} />
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0} size="lg">
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              Indietro
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/account")}
              size="lg"
              className="text-muted-foreground hover:text-foreground"
            >
              <User className="mr-2 h-4 w-4" />
              Area personale
            </Button>
          </div>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()} size="lg">
              Avanti
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </CustomerAuthGuard>
  )
}
