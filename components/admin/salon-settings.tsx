"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Building2, Clock, Calendar, Users, Mail, Phone, MapPin, Link as LinkIcon, Save } from "lucide-react"
import type { Salon, SalonConfig } from "@/types"
import { updateSalonInfo, updateSalonConfig } from "@/app/actions/salon"

interface SalonSettingsProps {
  salon: Salon
}

export function SalonSettings({ salon: initialSalon }: SalonSettingsProps) {
  const router = useRouter()
  const [salon] = useState(initialSalon)
  const [saving, setSaving] = useState(false)
  
  // Salon info state
  const [name, setName] = useState(salon.name)
  const [email, setEmail] = useState(salon.email)
  const [phone, setPhone] = useState(salon.phone || "")
  const [address, setAddress] = useState(salon.address || "")
  const [city, setCity] = useState(salon.city || "")
  
  // Config state
  const [openingTime, setOpeningTime] = useState(salon.config.openingTime)
  const [closingTime, setClosingTime] = useState(salon.config.closingTime)
  const [timeStep, setTimeStep] = useState(salon.config.timeStep)
  const [resources, setResources] = useState(salon.config.resources)
  const [bufferTime, setBufferTime] = useState(salon.config.bufferTime)
  
  // Closed days
  const [closedDays, setClosedDays] = useState<number[]>(salon.config.closedDaysOfWeek || [])
  const [closedDates, setClosedDates] = useState<string[]>(salon.config.closedDates || [])

  const dayNames = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]

  const toggleClosedDay = (day: number) => {
    if (closedDays.includes(day)) {
      setClosedDays(closedDays.filter((d) => d !== day))
    } else {
      setClosedDays([...closedDays, day])
    }
  }

  const addClosedDate = () => {
    const date = prompt("Inserisci una data di chiusura (YYYY-MM-DD):")
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      if (!closedDates.includes(date)) {
        setClosedDates([...closedDates, date])
      }
    } else if (date) {
      alert("Formato data non valido. Usa YYYY-MM-DD")
    }
  }

  const removeClosedDate = (date: string) => {
    setClosedDates(closedDates.filter((d) => d !== date))
  }

  const handleSaveInfo = async () => {
    setSaving(true)
    try {
      const result = await updateSalonInfo(salon.id, {
        name,
        email,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
      })
      if (result.success) {
        router.refresh()
        alert("Informazioni salone aggiornate con successo!")
      } else {
        alert(result.error || "Errore durante il salvataggio")
      }
    } catch (error) {
      alert("Errore durante il salvataggio")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      const result = await updateSalonConfig(salon.id, {
        openingTime,
        closingTime,
        timeStep,
        resources,
        bufferTime,
        closedDaysOfWeek: closedDays,
        closedDates,
      })
      if (result.success) {
        router.refresh()
        alert("Configurazione aggiornata con successo!")
      } else {
        alert(result.error || "Errore durante il salvataggio")
      }
    } catch (error) {
      alert("Errore durante il salvataggio")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Salon Info */}
      <Card className="border-2 border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informazioni Salone
          </CardTitle>
          <CardDescription>Modifica nome, contatti e indirizzo del salone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Salone *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Città</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Indirizzo</Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Link pubblico:</span>
              <code className="text-sm bg-background px-2 py-1 rounded">{salon.publicLink}</code>
            </div>
          </div>
          <Button onClick={handleSaveInfo} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvataggio..." : "Salva Informazioni"}
          </Button>
        </CardContent>
      </Card>

      {/* Salon Config */}
      <Card className="border-2 border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurazione Orari
          </CardTitle>
          <CardDescription>Configura orari di apertura, risorse e buffer time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="openingTime">Orario Apertura *</Label>
              <Input
                id="openingTime"
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingTime">Orario Chiusura *</Label>
              <Input
                id="closingTime"
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeStep">Intervallo Slot (minuti) *</Label>
              <Input
                id="timeStep"
                type="number"
                min={5}
                max={60}
                step={5}
                value={timeStep}
                onChange={(e) => setTimeStep(Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Intervallo tra uno slot e l'altro (es. 15 minuti)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resources">Numero Risorse/Operatori *</Label>
              <Input
                id="resources"
                type="number"
                min={1}
                max={10}
                value={resources}
                onChange={(e) => setResources(Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Numero di operatori/postazioni parallele</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bufferTime">Tempo Buffer (minuti) *</Label>
              <Input
                id="bufferTime"
                type="number"
                min={0}
                max={60}
                step={5}
                value={bufferTime}
                onChange={(e) => setBufferTime(Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Tempo tra un appuntamento e l'altro</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base">Giorni di Chiusura Settimanali</Label>
                <p className="text-sm text-muted-foreground">Seleziona i giorni in cui il salone è sempre chiuso</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dayNames.map((dayName, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Switch
                    checked={closedDays.includes(index)}
                    onCheckedChange={() => toggleClosedDay(index)}
                    id={`day-${index}`}
                  />
                  <Label htmlFor={`day-${index}`} className="cursor-pointer">
                    {dayName}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base">Date di Chiusura / Ferie</Label>
                <p className="text-sm text-muted-foreground">Aggiungi date specifiche di chiusura (formato: YYYY-MM-DD)</p>
              </div>
              <Button size="sm" variant="outline" onClick={addClosedDate}>
                <Calendar className="mr-2 h-4 w-4" />
                Aggiungi Data
              </Button>
            </div>
            {closedDates.length > 0 ? (
              <div className="space-y-2">
                {closedDates.map((date) => (
                  <div key={date} className="flex items-center justify-between p-2 border rounded-lg">
                    <span className="text-sm">{date}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeClosedDate(date)}
                      className="h-6 w-6 p-0 text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nessuna data di chiusura aggiunta</p>
            )}
          </div>

          <Button onClick={handleSaveConfig} disabled={saving} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvataggio..." : "Salva Configurazione"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

