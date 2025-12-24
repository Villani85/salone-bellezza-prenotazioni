# Sistema di Prenotazione Salone di Bellezza

Sistema completo di gestione prenotazioni online per saloni di bellezza, costruito con Next.js 16 (App Router), TypeScript, Firebase Firestore, Firebase Authentication, Firebase Storage e Tailwind CSS. Il sistema supporta prenotazioni multi-step, gestione clienti, dashboard admin, email notifications e gestione servizi con immagini.

## 🎯 Panoramica del Progetto

Questo è un sistema di prenotazione completo per saloni di bellezza che permette:

### Per i Clienti:
- **Registrazione e Login**: Sistema di autenticazione obbligatoria prima della prenotazione
- **Area Personale**: Dashboard dove i clienti possono vedere:
  - Tutte le loro prenotazioni (confermate, in attesa, rifiutate)
  - Statistiche personali (prenotazioni totali, confermate, totale speso)
  - Servizi utilizzati con conteggio e spesa totale
  - Slot alternativi proposti dall'admin
- **Prenotazione Multi-Step**: Wizard intuitivo in 4 passaggi:
  1. Selezione servizio (con immagini)
  2. Selezione data (rispetta giorni chiusi e date specifiche)
  3. Selezione orario (calcolo automatico disponibilità)
  4. Conferma prenotazione
- **Gestione Slot Alternativi**: I clienti possono accettare o rifiutare slot alternativi proposti dall'admin

### Per gli Amministratori:
- **Dashboard Admin**: 
  - Statistiche giornaliere (prenotazioni confermate, in attesa, rifiutate)
  - Lista prenotazioni in attesa con azioni (conferma, rifiuta, propone alternative)
  - Visualizzazione calendario settimanale
- **Gestione Servizi**: CRUD completo per servizi con upload immagini
- **Gestione Clienti**: Visualizzazione profili clienti con dati di segmentazione
- **Impostazioni Salone**: Configurazione orari, giorni chiusi, date specifiche di chiusura
- **Login con Username**: Sistema di autenticazione admin con username personalizzato

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 16 (App Router) con Server Actions
- **Linguaggio**: TypeScript
- **Database**: Firebase Firestore (NoSQL)
- **Autenticazione**: Firebase Auth (Email/Password)
- **Storage**: Firebase Storage (per immagini servizi)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (basato su Radix UI)
- **Gestione date**: date-fns con locale italiano
- **Email**: Resend API (opzionale)
- **Logging**: Sistema di logging custom con logger strutturato

## 📐 Architettura del Progetto

### Struttura Directory

```
salone/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions (server-side)
│   │   ├── admin-auth.ts         # Autenticazione admin
│   │   ├── admin-bookings.ts     # Gestione prenotazioni admin
│   │   ├── availability.ts        # Calcolo disponibilità slot
│   │   ├── booking-alternatives.ts # Gestione slot alternativi
│   │   ├── create-booking.ts     # Creazione prenotazione
│   │   ├── customer-auth.ts      # Registrazione/login clienti
│   │   ├── customers.ts          # CRUD clienti
│   │   ├── email.ts              # Invio email
│   │   ├── get-all-bookings.ts   # Fetch prenotazioni
│   │   ├── get-services.ts       # Fetch servizi
│   │   ├── get-salon-config.ts   # Configurazione salone
│   │   ├── salon.ts              # Gestione salone
│   │   ├── services.ts           # CRUD servizi
│   │   └── upload-image.ts       # Upload immagini Firebase Storage
│   ├── admin/                    # Route admin (protette)
│   │   ├── dashboard/            # Dashboard principale
│   │   ├── calendar/             # Calendario settimanale
│   │   ├── services/             # Gestione servizi
│   │   ├── customers/            # Lista e dettagli clienti
│   │   ├── settings/             # Impostazioni salone
│   │   └── login/                # Login admin
│   ├── book/                     # Route prenotazione (protetta)
│   ├── account/                  # Area personale cliente (protetta)
│   ├── login/                    # Login cliente
│   ├── register/                 # Registrazione cliente
│   ├── layout.tsx                # Layout principale
│   └── page.tsx                  # Homepage
├── components/                   # Componenti React
│   ├── admin/                    # Componenti admin
│   │   ├── auth-guard.tsx        # Protezione route admin
│   │   ├── booking-table.tsx     # Tabella prenotazioni
│   │   ├── customer-profile.tsx   # Profilo cliente
│   │   ├── customers-list.tsx    # Lista clienti
│   │   ├── salon-settings.tsx    # Form impostazioni
│   │   ├── services-manager.tsx  # Gestione servizi CRUD
│   │   └── weekly-calendar.tsx   # Calendario settimanale
│   ├── booking/                  # Componenti prenotazione
│   │   ├── alternative-slots-selector.tsx # Selezione slot alternativi
│   │   ├── booking-summary.tsx   # Riepilogo prenotazione
│   │   ├── booking-wizard.tsx    # Wizard multi-step
│   │   ├── customer-account-guard.tsx # Protezione area personale
│   │   ├── customer-auth-guard.tsx # Protezione route cliente
│   │   ├── customer-bookings-list.tsx # Lista prenotazioni cliente
│   │   ├── customer-login-form.tsx # Form login
│   │   ├── customer-registration-form.tsx # Form registrazione
│   │   ├── date-selector.tsx     # Selezione data
│   │   ├── service-selector.tsx   # Selezione servizio
│   │   └── slot-selector.tsx      # Selezione orario
│   └── ui/                       # Componenti UI (shadcn/ui)
├── lib/                          # Utilities e configurazione
│   ├── firebase.ts               # Config Firebase Client SDK
│   ├── firebase-admin.ts         # Config Firebase Admin SDK
│   ├── firestore-utils.ts        # Utility Firestore (timestamp conversion)
│   ├── logger.ts                 # Sistema di logging
│   └── utils.ts                  # Utility generali
├── types/                        # Definizioni TypeScript
│   └── index.ts                  # Tutti i tipi/interfacce
├── scripts/                      # Script Python per setup
│   ├── add-services.py          # Popolamento servizi
│   ├── create-admin-with-username.py # Creazione admin
│   └── create-admin-quick.py     # Creazione admin rapida
├── firestore.indexes.json        # Indici Firestore
├── storage.rules                  # Regole Firebase Storage
└── next.config.mjs               # Configurazione Next.js
```

## 📊 Modello Dati

### Collezioni Firestore

#### `services` - Servizi del salone
```typescript
{
  id: string
  name: string                    // "Taglio e piega"
  category: ServiceCategory       // "Capelli" | "Estetica" | "Unghie" | "Depilazione" | "Altro"
  description?: string
  duration: number                // minuti (es: 60)
  price: number                   // euro (es: 50.00)
  active: boolean                 // visibile per prenotazioni
  imageUrl?: string               // URL Firebase Storage
  salonId?: string
  createdAt: string
  updatedAt: string
}
```

#### `bookings` - Prenotazioni
```typescript
{
  id: string
  date: string                    // "YYYY-MM-DD"
  startTime: string               // "HH:mm"
  endTime: string                 // "HH:mm"
  status: BookingStatus          // "PENDING" | "CONFIRMED" | "REJECTED" | "ALTERNATIVE_PROPOSED" | "CANCELLED"
  customerId: string              // ID cliente
  serviceId: string
  salonId: string
  rejectionReason?: string
  alternativeSlots?: AlternativeSlot[]  // Slot alternativi proposti
  selectedAlternativeSlot?: AlternativeSlot
  serviceName?: string            // Denormalizzato
  servicePrice?: number           // Denormalizzato
  customerName?: string           // Denormalizzato
  customerEmail?: string          // Denormalizzato
  createdAt: string
  updatedAt: string
  confirmedBy?: string            // Admin UID
  rejectedBy?: string             // Admin UID
}
```

#### `customers` - Clienti
```typescript
{
  id: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  gender: Gender                  // "Uomo" | "Donna" | "Preferisco non dirlo"
  birthMonth?: number            // 1-12
  birthDay?: number              // 1-31
  city?: string
  postalCode?: string
  timePreference?: TimePreference
  acquisitionChannel?: AcquisitionChannel
  interests: string[]            // Array di service IDs
  tags: string[]                // Tag per segmentazione
  internalNotes?: string         // Note admin
  createdAt: string
  updatedAt: string
}
```

#### `salons` - Configurazione salone
```typescript
{
  id: string                     // Di solito "default"
  name: string
  slug: string
  email: string
  phone?: string
  address?: string
  city?: string
  config: {
    openingTime: string           // "09:00"
    closingTime: string           // "19:00"
    timeStep: number              // 15 (minuti)
    resources: number             // 3 (operatori paralleli)
    bufferTime: number             // 10 (minuti tra appuntamenti)
    closedDaysOfWeek: number[]   // [0] = domenica, [1] = lunedì
    closedDates: string[]         // ["2024-12-25", "2025-01-01"]
  }
  createdAt: string
  updatedAt: string
}
```

#### `admins` - Amministratori
```typescript
{
  id: string                      // Firebase Auth UID
  active: boolean
  email: string
  createdAt: string
}
```

#### `adminUsers` - Mapping username → email
```typescript
{
  id: string                      // username
  email: string                   // email Firebase Auth
  uid: string                     // Firebase Auth UID
}
```

## 🔄 Flussi Principali

### Flusso Prenotazione Cliente

1. **Autenticazione Obbligatoria**
   - Cliente accede a `/book`
   - `CustomerAuthGuard` verifica autenticazione
   - Se non autenticato → redirect a `/login?redirect=/book`

2. **Registrazione/Login**
   - Se nuovo cliente → `/register` → crea account Firebase Auth + documento `customers`
   - Se cliente esistente → `/login` → verifica credenziali

3. **Wizard Prenotazione** (`/book`)
   - **Step 1**: `ServiceSelector` - mostra servizi attivi con immagini
   - **Step 2**: `DateSelector` - calendario con giorni chiusi disabilitati
   - **Step 3**: `SlotSelector` - chiama `getAvailableSlots` (Server Action)
     - Calcola slot disponibili considerando:
       - Orari apertura/chiusura
       - Durata servizio
       - Buffer time
       - Risorse parallele
       - Prenotazioni esistenti (CONFIRMED, PENDING)
       - Giorni chiusi e date specifiche
   - **Step 4**: `BookingSummary` - riepilogo e conferma
     - Chiama `createBooking` (Server Action)
     - Crea documento in `bookings` con status "PENDING"
     - Redirect a `/account`

4. **Area Personale** (`/account`)
   - `CustomerBookingsList` mostra:
     - Statistiche (totali, confermate, in attesa, totale speso)
     - Servizi utilizzati con conteggio
     - Prenotazioni con slot alternativi (in evidenza)
     - Altre prenotazioni ordinate per stato

### Flusso Gestione Admin

1. **Login Admin** (`/admin/login`)
   - Login con username (non email)
   - `getAdminEmailByUsername` risolve email
   - Autenticazione Firebase Auth
   - Verifica esistenza in `admins`

2. **Dashboard** (`/admin/dashboard`)
   - `getPendingBookings` - prenotazioni in attesa
   - `getTodayStats` - statistiche giornaliere
   - `BookingTable` con azioni:
     - **Conferma**: aggiorna status → "CONFIRMED", invia email
     - **Rifiuta**: aggiorna status → "REJECTED", invia email
     - **Proponi Alternative**: 
       - Carica slot disponibili alternativi
       - Aggiorna status → "ALTERNATIVE_PROPOSED"
       - Salva `alternativeSlots` (2-3 opzioni)
       - Invia email con link a `/account`

3. **Gestione Servizi** (`/admin/services`)
   - `ServicesManager` - CRUD completo
   - Upload immagini → Firebase Storage
   - Salva `imageUrl` in documento servizio

4. **Impostazioni** (`/admin/settings`)
   - Configura orari, giorni chiusi, date specifiche
   - Salva in `salons/default/config`

### Flusso Slot Alternativi

1. **Admin propone alternative**
   - Admin seleziona 2-3 slot alternativi
   - Booking status → "ALTERNATIVE_PROPOSED"
   - Email al cliente con link `/login?redirect=/account`

2. **Cliente accetta/rifiuta**
   - Cliente vede slot alternativi in `/account`
   - `AlternativeSlotsSelector` mostra opzioni
   - **Accetta**: `acceptAlternativeSlot`
     - Aggiorna booking: date, startTime, endTime, status → "CONFIRMED"
     - Salva `selectedAlternativeSlot`
     - Invia email conferma
   - **Rifiuta**: `rejectAlternativeSlots`
     - Aggiorna status → "REJECTED"
     - Salva `rejectionReason`

## 🔐 Sicurezza

### Firestore Security Rules

- **Services**: Lettura pubblica, scrittura solo admin
- **Bookings**: 
  - Creazione pubblica (solo status "PENDING")
  - Lettura: cliente stesso o admin
  - Update: solo admin
- **Customers**: Lettura/scrittura: cliente stesso o admin
- **Admins**: Solo admin possono leggere/scrivere
- **Salons**: Lettura pubblica, scrittura solo admin

### Firebase Storage Rules

- **services/{imageId}**: Lettura pubblica, scrittura solo admin autenticato

### Autenticazione

- **Clienti**: Firebase Auth (Email/Password) + documento `customers`
- **Admin**: Firebase Auth (Email/Password) + documento `admins` + mapping username

## 🎨 Componenti UI Principali

### Componenti Booking

- **`BookingWizard`**: Container wizard multi-step con progress bar
- **`ServiceSelector`**: Grid servizi con immagini, durata, prezzo
- **`DateSelector`**: Calendario con giorni chiusi disabilitati
- **`SlotSelector`**: Lista slot disponibili calcolati dinamicamente
- **`BookingSummary`**: Riepilogo con conferma finale
- **`CustomerBookingsList`**: Dashboard area personale con statistiche

### Componenti Admin

- **`BookingTable`**: Tabella prenotazioni con azioni (conferma/rifiuta/alternative)
- **`ServicesManager`**: Form CRUD servizi con upload immagini
- **`WeeklyCalendar`**: Calendario settimanale con prenotazioni e giorni chiusi
- **`SalonSettings`**: Form configurazione salone

### Guards

- **`CustomerAuthGuard`**: Protegge route cliente, verifica Firebase Auth + documento `customers`
- **`AdminAuthGuard`**: Protegge route admin, verifica Firebase Auth + documento `admins`
- **`CustomerAccountGuard`**: Protegge `/account`, redirect a `/login` se non autenticato

## 📧 Sistema Email

Email inviate tramite Resend API (opzionale):

- **Booking Confirmed**: Conferma prenotazione
- **Booking Rejected**: Rifiuto con motivo
- **Alternative Slots**: Proposta slot alternativi con link a `/login?redirect=/account`

## 🚀 Setup e Deploy

### Variabili d'Ambiente

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Email (opzionale)
RESEND_API_KEY=
EMAIL_FROM=
NEXT_PUBLIC_APP_URL=
```

### Setup Iniziale

1. Installa dipendenze: `pnpm install`
2. Configura `.env.local`
3. Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
4. Configura Firestore Security Rules
5. Configura Firebase Storage Rules
6. Popola servizi: `python scripts/add-services.py`
7. Crea admin: `python scripts/create-admin-quick.py`

## 🎯 Caratteristiche Chiave per V0

Quando V0 genera codice per questo progetto, deve considerare:

1. **Server Actions**: Tutte le operazioni database sono Server Actions in `app/actions/`
2. **Firebase Admin SDK**: Server Actions usano `getAdminDb()` per bypassare security rules
3. **Firebase Client SDK**: Componenti client usano `db` e `auth` da `lib/firebase.ts`
4. **Type Safety**: Tutti i tipi sono definiti in `types/index.ts`
5. **Serialization**: Timestamp Firestore devono essere convertiti con `convertTimestamp`
6. **Authentication Guards**: Route protette usano guard components
7. **Image Upload**: Usa Firebase Storage con `uploadServiceImage` (client-side)
8. **Date Handling**: Usa `date-fns` con locale italiano
9. **UI Components**: Usa componenti da `components/ui/` (shadcn/ui)
10. **Error Handling**: Usa `logger` per logging strutturato

## 📝 Note per Sviluppatori

- **Server Components vs Client Components**: 
  - Server Actions sono sempre "use server"
  - Componenti con interattività sono "use client"
  - Evitare import di `firebase-admin` in client components

- **Timestamp Serialization**: 
  - Firestore Timestamp non sono serializzabili
  - Usa `convertTimestamp` da `lib/firestore-utils.ts`

- **Permission Errors**: 
  - Server Actions devono usare `getAdminDb()` non `db`
  - Client components usano `db` con security rules

- **Image Optimization**: 
  - Next.js Image component supporta Firebase Storage URLs
  - Configurato in `next.config.mjs`

---

Sviluppato con ❤️ usando Next.js 16, TypeScript, Firebase e Tailwind CSS
