"use client"

import { useState } from "react"
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parse } from "date-fns"
import { it } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, X } from "lucide-react"
import type { Booking, SalonConfig } from "@/types"

interface WeeklyCalendarProps {
  bookings: Booking[]
  salonConfig?: SalonConfig | null
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 9) // 9:00 to 20:00

export function WeeklyCalendar({ bookings, salonConfig }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const isDayClosed = (day: Date): boolean => {
    const dayStr = format(day, "yyyy-MM-dd")
    const dayOfWeek = day.getDay()
    
    // Check if date is in closed dates
    if (salonConfig?.closedDates?.includes(dayStr)) {
      return true
    }
    
    // Check if day of week is closed
    if (salonConfig?.closedDaysOfWeek?.includes(dayOfWeek)) {
      return true
    }
    
    return false
  }

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const getBookingsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd")
    return bookings.filter((booking) => booking.date === dayStr)
  }

  const getBookingsForHour = (day: Date, hour: number) => {
    const dayBookings = getBookingsForDay(day)
    return dayBookings.filter((booking) => {
      const [bookingHour] = booking.startTime.split(":").map(Number)
      return bookingHour === hour
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 border-green-300 text-green-800"
      case "PENDING":
        return "bg-yellow-100 border-yellow-300 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 border-red-300 text-red-800"
      case "ALTERNATIVE_PROPOSED":
        return "bg-blue-100 border-blue-300 text-blue-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  return (
    <Card className="border-2 border-gray-200 bg-white shadow-xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Oggi
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold">
              {format(weekStart, "d MMMM", { locale: it })} - {format(addDays(weekStart, 6), "d MMMM yyyy", { locale: it })}
            </h2>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Days Header */}
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="text-sm font-medium text-muted-foreground"></div>
                {weekDays.map((day) => {
                  const isClosed = isDayClosed(day)
                  return (
                    <div
                      key={day.toISOString()}
                      className={`text-center p-2 rounded-lg ${
                        isSameDay(day, new Date()) ? "bg-primary/10 font-semibold" : ""
                      } ${isClosed ? "bg-red-50 border-2 border-red-300" : ""}`}
                    >
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        {format(day, "EEE", { locale: it })}
                        {isClosed && <X className="h-3 w-3 text-red-500" />}
                      </div>
                      <div className="text-lg">{format(day, "d")}</div>
                      {isClosed && (
                        <div className="text-xs text-red-600 font-medium mt-1">Chiuso</div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Time Slots */}
              <div className="space-y-1">
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 gap-2">
                    <div className="text-xs text-muted-foreground text-right pr-2 py-1">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    {weekDays.map((day) => {
                      const hourBookings = getBookingsForHour(day, hour)
                      const isClosed = isDayClosed(day)
                      return (
                        <div
                          key={`${day.toISOString()}-${hour}`}
                          className={`min-h-[60px] border rounded p-1 ${
                            isClosed
                              ? "border-red-300 bg-red-50/30 opacity-60"
                              : "border-gray-200 bg-gray-50/50"
                          }`}
                        >
                          {isClosed ? (
                            <div className="flex items-center justify-center h-full text-xs text-red-600 font-medium">
                              Chiuso
                            </div>
                          ) : (
                            hourBookings.map((booking) => (
                              <div
                                key={booking.id}
                                className={`text-xs p-1 rounded mb-1 border ${getStatusColor(booking.status)}`}
                                title={`${booking.customerName || "Cliente"} - ${booking.serviceName || "Servizio"}`}
                              >
                                <div className="font-medium truncate">{booking.customerName || "Cliente"}</div>
                                <div className="text-xs opacity-75">{booking.startTime}</div>
                                <div className="text-xs opacity-75 truncate">{booking.serviceName || "Servizio"}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
              <span className="text-sm">Confermate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
              <span className="text-sm">In Attesa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
              <span className="text-sm">Alternative Proposte</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
              <span className="text-sm">Rifiutate</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

