"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircleIcon, Eye, EyeOff, User, Mail, Lock, Calendar, MapPin, Clock, Radio } from "lucide-react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { registerCustomer, linkFirebaseUserToCustomer } from "@/app/actions/customer-auth"
import { getCustomerByEmail } from "@/app/actions/customers"
import { getServices } from "@/app/actions/get-services"
import type { Gender, TimePreference, AcquisitionChannel, Service } from "@/types"
import Link from "next/link"

export function CustomerRegistrationForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Required fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [password, setPassword] = useState("")
  const [gender, setGender] = useState<Gender>("Preferisco non dirlo")

  // Optional fields
  const [birthMonth, setBirthMonth] = useState<string>("")
  const [birthDay, setBirthDay] = useState<string>("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [timePreference, setTimePreference] = useState<TimePreference | "">("")
  const [acquisitionChannel, setAcquisitionChannel] = useState<AcquisitionChannel | "">("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>([])

  // Load services for interests
  useEffect(() => {
    getServices().then(setServices).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate required fields
      if (!firstName.trim() || !lastName.trim()) {
        setError("Nome e cognome sono obbligatori")
        setLoading(false)
        return
      }

      if (email !== confirmEmail) {
        setError("Le email non corrispondono")
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError("La password deve essere di almeno 6 caratteri")
        setLoading(false)
        return
      }

      // First, register customer in Firestore
      const result = await registerCustomer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        confirmEmail: confirmEmail.trim(),
        password, // Not stored, only for Firebase Auth
        gender,
        birthMonth: birthMonth ? parseInt(birthMonth) : undefined,
        birthDay: birthDay ? parseInt(birthDay) : undefined,
        city: city.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        timePreference: timePreference || undefined,
        acquisitionChannel: acquisitionChannel || undefined,
        interests: selectedInterests,
      })

      if (!result.success) {
        setError(result.error || "Errore durante la registrazione")
        setLoading(false)
        return
      }

      // Then create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUserId = userCredential.user.uid

      // Link Firebase Auth user to customer document using Server Action
      if (result.customerId) {
        const linkResult = await linkFirebaseUserToCustomer(result.customerId, firebaseUserId)
        if (!linkResult.success) {
          // If linking fails, delete the auth user
          await auth.currentUser?.delete()
          setError(linkResult.error || "Errore durante il collegamento dell'account")
          setLoading(false)
          return
        }
      }

      // Redirect to booking page
      router.push("/book")
    } catch (err: any) {
      console.error("Registration error:", err)
      if (err.code === "auth/email-already-in-use") {
        setError("Un account con questa email esiste già. Effettua il login.")
      } else if (err.code === "auth/weak-password") {
        setError("La password è troppo debole. Usa almeno 6 caratteri.")
      } else {
        setError(err.message || "Errore durante la registrazione. Riprova più tardi.")
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = (serviceId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    )
  }

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Crea il tuo account</CardTitle>
        <CardDescription>Compila il form per registrarti e prenotare i servizi</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircleIcon className="size-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dati obbligatori</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Mario"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Rossi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="mario.rossi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmEmail">Conferma Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmEmail"
                  type="email"
                  placeholder="mario.rossi@example.com"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Minimo 6 caratteri</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Genere *</Label>
              <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Seleziona genere" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Donna">Donna</SelectItem>
                  <SelectItem value="Uomo">Uomo</SelectItem>
                  <SelectItem value="Preferisco non dirlo">Preferisco non dirlo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-600">Dati opzionali (per personalizzazione)</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birthMonth">Mese di nascita</Label>
                <Select value={birthMonth} onValueChange={setBirthMonth}>
                  <SelectTrigger id="birthMonth">
                    <SelectValue placeholder="Seleziona mese" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {new Date(2000, month - 1).toLocaleString("it-IT", { month: "long" })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDay">Giorno di nascita</Label>
                <Select value={birthDay} onValueChange={setBirthDay}>
                  <SelectTrigger id="birthDay">
                    <SelectValue placeholder="Seleziona giorno" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="city"
                    type="text"
                    placeholder="Roma"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">CAP</Label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="00100"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  maxLength={5}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timePreference">Preferenza oraria</Label>
              <Select value={timePreference} onValueChange={(value) => setTimePreference(value as TimePreference)}>
                <SelectTrigger id="timePreference">
                  <SelectValue placeholder="Seleziona preferenza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mattina">Mattina</SelectItem>
                  <SelectItem value="Pomeriggio">Pomeriggio</SelectItem>
                  <SelectItem value="Sera">Sera</SelectItem>
                  <SelectItem value="Weekend">Weekend</SelectItem>
                  <SelectItem value="Flessibile">Flessibile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisitionChannel">Come ci hai conosciuto?</Label>
              <Select
                value={acquisitionChannel}
                onValueChange={(value) => setAcquisitionChannel(value as AcquisitionChannel)}
              >
                <SelectTrigger id="acquisitionChannel">
                  <SelectValue placeholder="Seleziona canale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Passaparola">Passaparola</SelectItem>
                  <SelectItem value="Altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Servizi di interesse (seleziona quelli che ti interessano)</Label>
              <div className="grid gap-2 md:grid-cols-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {services.slice(0, 10).map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`interest-${service.id}`}
                      checked={selectedInterests.includes(service.id)}
                      onCheckedChange={() => toggleInterest(service.id)}
                    />
                    <Label
                      htmlFor={`interest-${service.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Registrazione in corso...
                </>
              ) : (
                "Registrati"
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Hai già un account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Accedi qui
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

