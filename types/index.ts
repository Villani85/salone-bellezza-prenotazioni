// ==================== SALONE ====================
export interface Salon {
  id: string
  name: string
  slug: string // URL-friendly identifier (e.g., "salone-bellezza-centro")
  email: string
  phone?: string
  address?: string
  city?: string
  publicLink: string // Generated automatically from slug
  config: SalonConfig
  createdAt: string
  updatedAt?: string
}

export interface SalonConfig {
  openingTime: string // "09:00"
  closingTime: string // "19:00"
  timeStep: number // minutes (e.g., 15)
  resources: number // number of parallel resources (e.g., 3)
  bufferTime: number // minutes (e.g., 10)
  closedDaysOfWeek: number[] // [0] = Sunday, [1] = Monday, etc.
  closedDates: string[] // ["2024-12-25", "2025-01-01"] - YYYY-MM-DD format
}

// ==================== SERVIZI ====================
export type ServiceCategory = "Capelli" | "Estetica" | "Unghie" | "Depilazione" | "Altro"

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  description?: string
  duration: number // minutes
  price: number
  active: boolean
  imageUrl?: string // URL of the service image
  salonId?: string // For multi-salon support
  createdAt?: string
  updatedAt?: string
}

// ==================== CLIENTI ====================
export type Gender = "Uomo" | "Donna" | "Preferisco non dirlo"
export type TimePreference = "Mattina" | "Pomeriggio" | "Sera" | "Weekend" | "Flessibile"
export type AcquisitionChannel = "Instagram" | "Google" | "Facebook" | "Passaparola" | "Altro"

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  gender: Gender
  // Optional segmentation data
  birthMonth?: number // 1-12
  birthDay?: number // 1-31
  city?: string
  postalCode?: string
  timePreference?: TimePreference
  acquisitionChannel?: AcquisitionChannel
  interests: string[] // Array of service/product IDs or names
  // Metadata
  tags: string[] // Auto-generated tags for segmentation
  internalNotes?: string // Admin-only notes
  createdAt: string
  updatedAt?: string
}

// ==================== PRENOTAZIONI ====================
export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "ALTERNATIVE_PROPOSED" | "CANCELLED"

export interface AlternativeSlot {
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
}

export interface Booking {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: BookingStatus
  customerId: string // Changed from userId to customerId
  serviceId: string
  salonId: string
  // Advanced fields
  rejectionReason?: string // Reason for rejection (optional)
  alternativeSlots?: AlternativeSlot[] // Proposed alternatives (2-3 slots)
  selectedAlternativeSlot?: AlternativeSlot // Which alternative customer selected
  // Metadata
  serviceName?: string // Denormalized for faster queries
  servicePrice?: number
  customerName?: string // Denormalized
  customerEmail?: string // Denormalized
  createdAt: string
  updatedAt?: string
  confirmedBy?: string // Admin UID who confirmed
  rejectedBy?: string // Admin UID who rejected
}

// ==================== UTENTI (Admin) ====================
export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  createdAt?: string
}

// ==================== EMAIL ====================
export interface EmailLog {
  id: string
  to: string
  subject: string
  template: string // "booking-confirmed", "booking-rejected", etc.
  bookingId?: string
  customerId?: string
  sentAt: string
  status: "sent" | "failed" | "pending"
  error?: string
}

// ==================== SEGMENTAZIONE ====================
export interface CustomerSegment {
  id: string
  name: string
  description?: string
  filters: SegmentFilter[]
  customerCount?: number
  createdAt: string
}

export interface SegmentFilter {
  field: "tag" | "service" | "interest" | "timePreference" | "acquisitionChannel" | "lastBookingDate"
  operator: "equals" | "contains" | "in" | "greaterThan" | "lessThan"
  value: string | string[] | number
}
