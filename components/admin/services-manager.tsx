"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Edit, Trash2, Check, X, AlertCircle } from "lucide-react"
import { createService, updateService, deleteService } from "@/app/actions/services"
import { uploadServiceImage } from "@/app/actions/upload-image"
import type { Service, ServiceCategory } from "@/types"
import Image from "next/image"

interface ServicesManagerProps {
  initialServices: Service[]
}

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>(initialServices)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [category, setCategory] = useState<ServiceCategory>("Altro")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState<number>(30)
  const [price, setPrice] = useState<number>(0)
  const [active, setActive] = useState<boolean>(true)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)

  const categories: ServiceCategory[] = ["Capelli", "Estetica", "Unghie", "Depilazione", "Altro"]

  const resetForm = () => {
    setName("")
    setCategory("Altro")
    setDescription("")
    setDuration(30)
    setPrice(0)
    setActive(true)
    setImageUrl("")
    setImageFile(null)
    setImagePreview("")
    setEditingService(null)
    setError(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleOpenEdit = (service: Service) => {
    setEditingService(service)
    setName(service.name)
    setCategory(service.category)
    setDescription(service.description || "")
    setDuration(service.duration)
    setPrice(service.price)
    setActive(service.active)
    setImageUrl(service.imageUrl || "")
    setImageFile(null)
    setImagePreview(service.imageUrl || "")
    setError(null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    resetForm()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let finalImageUrl = imageUrl

      // Upload new image if a file was selected
      if (imageFile) {
        setUploadingImage(true)
        const uploadResult = await uploadServiceImage(imageFile)
        if (!uploadResult.success) {
          setError(uploadResult.error || "Errore durante il caricamento dell'immagine")
          setLoading(false)
          setUploadingImage(false)
          return
        }
        finalImageUrl = uploadResult.imageUrl || ""
        setUploadingImage(false)
      }

      if (editingService) {
        // Update existing service
        const result = await updateService(editingService.id, {
          name,
          category,
          description,
          duration,
          price,
          active,
          imageUrl: finalImageUrl,
        })

        if (result.success) {
          router.refresh()
          handleCloseDialog()
        } else {
          setError(result.error || "Errore durante l'aggiornamento")
        }
      } else {
        // Create new service
        const result = await createService({
          name,
          category,
          description,
          duration,
          price,
          active,
          imageUrl: finalImageUrl,
        })

        if (result.success) {
          router.refresh()
          handleCloseDialog()
        } else {
          setError(result.error || "Errore durante la creazione")
        }
      }
    } catch (err: any) {
      setError(err.message || "Errore imprevisto")
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo servizio? Questa azione non può essere annullata.")) {
      return
    }

    setLoading(true)
    try {
      const result = await deleteService(serviceId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Errore durante l'eliminazione")
      }
    } catch (err: any) {
      alert("Errore durante l'eliminazione")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: ServiceCategory) => {
    switch (category) {
      case "Capelli":
        return "bg-purple-100 text-purple-700 border-purple-300"
      case "Estetica":
        return "bg-pink-100 text-pink-700 border-pink-300"
      case "Unghie":
        return "bg-rose-100 text-rose-700 border-rose-300"
      case "Depilazione":
        return "bg-blue-100 text-blue-700 border-blue-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Servizi del Salone</CardTitle>
              <CardDescription>Gestisci tutti i servizi offerti dal salone</CardDescription>
            </div>
            <Button onClick={handleOpenCreate} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Aggiungi Servizio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nessun servizio disponibile</p>
              <Button onClick={handleOpenCreate} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi il primo servizio
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className="border-2">
                  {service.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={getCategoryColor(service.category)}>
                            {service.category}
                          </Badge>
                          {service.active ? (
                            <Badge variant="default" className="bg-green-500">
                              <Check className="mr-1 h-3 w-3" />
                              Attivo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100">
                              <X className="mr-1 h-3 w-3" />
                              Inattivo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Durata:</span>
                        <span className="font-medium">{service.duration} minuti</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prezzo:</span>
                        <span className="font-bold text-lg text-primary">€{service.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenEdit(service)}
                        disabled={loading}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifica
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(service.id)}
                        disabled={loading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Elimina
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Modifica Servizio" : "Nuovo Servizio"}</DialogTitle>
            <DialogDescription>
              {editingService
                ? "Modifica le informazioni del servizio"
                : "Compila il form per aggiungere un nuovo servizio"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <AlertCircle className="size-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="image">Immagine del Servizio</Label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Formati supportati: JPG, PNG, GIF. Dimensione massima: 5MB
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Servizio *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Es: Taglio e piega"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as ServiceCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione dettagliata del servizio..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Durata (minuti) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prezzo (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="active" className="text-sm font-normal cursor-pointer">
                Servizio attivo (visibile per le prenotazioni)
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={loading}>
                Annulla
              </Button>
              <Button type="submit" disabled={loading || uploadingImage}>
                {loading || uploadingImage ? (
                  <>
                    <Spinner className="mr-2" />
                    {uploadingImage ? "Caricamento immagine..." : editingService ? "Aggiornamento..." : "Creazione..."}
                  </>
                ) : editingService ? (
                  "Aggiorna Servizio"
                ) : (
                  "Crea Servizio"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

