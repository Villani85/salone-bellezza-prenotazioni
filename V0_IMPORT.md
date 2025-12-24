# Guida Importazione V0

Questo documento descrive come importare e utilizzare questo progetto in V0 (Vercel).

## 📋 Prerequisiti

- Account V0 (Vercel)
- Repository GitHub del progetto
- Firebase project configurato

## 🚀 Importazione in V0

### Metodo 1: Import da GitHub (Raccomandato)

1. **Prepara il repository GitHub**
   - Assicurati che il progetto sia su GitHub
   - Verifica che tutti i file siano committati
   - Il README.md deve essere aggiornato (già fatto)

2. **Importa in V0**
   - Vai su [v0.dev](https://v0.dev)
   - Clicca su "Import Project"
   - Seleziona "Import from GitHub"
   - Autorizza V0 ad accedere al repository
   - Seleziona il repository `salone-bellezza-prenotazioni`

3. **Configurazione V0**
   - V0 leggerà automaticamente:
     - `package.json` per le dipendenze
     - `tsconfig.json` per la configurazione TypeScript
     - `README.md` per capire il progetto
     - Struttura delle directory

### Metodo 2: Upload Manuale

1. **Prepara i file**
   - Crea un archivio ZIP del progetto (escludi `node_modules`, `.next`, `.env*`)
   - Oppure usa `git archive`:
     ```bash
     git archive --format=zip --output=salone-v0.zip HEAD
     ```

2. **Upload in V0**
   - Vai su V0
   - Clicca su "Import Project"
   - Seleziona "Upload ZIP"
   - Carica il file ZIP

## 📝 Informazioni Chiave per V0

Quando V0 genera codice per questo progetto, deve considerare:

### Architettura

- **Next.js 16 App Router**: Tutte le route sono in `app/`
- **Server Actions**: Operazioni database in `app/actions/` con `"use server"`
- **Client Components**: Componenti interattivi con `"use client"`
- **TypeScript**: Tutti i file sono TypeScript (.ts, .tsx)

### Pattern Importanti

1. **Firebase Admin SDK** (Server Actions):
   ```typescript
   import { getAdminDb } from "@/lib/firebase-admin"
   const adminDb = getAdminDb()
   ```

2. **Firebase Client SDK** (Client Components):
   ```typescript
   import { db, auth, storage } from "@/lib/firebase"
   ```

3. **Server Actions**:
   ```typescript
   "use server"
   export async function myAction() { ... }
   ```

4. **Type Safety**:
   ```typescript
   import type { Service, Booking, Customer } from "@/types"
   ```

5. **Timestamp Serialization**:
   ```typescript
   import { convertTimestamp } from "@/lib/firestore-utils"
   createdAt: convertTimestamp(data.createdAt)
   ```

### Componenti UI

- Usa componenti da `@/components/ui/` (shadcn/ui)
- Pattern: `import { Button } from "@/components/ui/button"`
- Icone: `import { Calendar } from "lucide-react"`

### Styling

- Tailwind CSS con classi utility
- Pattern: `className="flex items-center gap-2"`
- Colori: usa variabili CSS da `app/globals.css`

### Routing

- Route pubbliche: `app/page.tsx`, `app/book/page.tsx`
- Route protette: `app/admin/*`, `app/account/page.tsx`
- Route dinamiche: `app/admin/customers/[id]/page.tsx`

### Autenticazione

- **Clienti**: `CustomerAuthGuard`, `CustomerAccountGuard`
- **Admin**: `AdminAuthGuard`
- Pattern: Wrappare componenti con guard

## 🎯 Esempi di Prompt per V0

Quando chiedi a V0 di generare codice, usa prompt specifici:

### Esempio 1: Nuovo Componente Booking
```
Crea un componente per visualizzare il riepilogo di una prenotazione.
Usa i tipi da @/types, componenti UI da @/components/ui,
e formatta le date con date-fns in italiano.
```

### Esempio 2: Nuova Server Action
```
Crea una Server Action per aggiornare lo stato di una prenotazione.
Usa getAdminDb() da @/lib/firebase-admin,
valida l'input, e usa il logger per logging.
```

### Esempio 3: Nuova Route Admin
```
Crea una nuova pagina admin per gestire i servizi.
Usa AdminAuthGuard, componenti da @/components/ui,
e Server Actions da @/app/actions/services.
```

## ⚠️ Note Importanti

1. **Non importare firebase-admin in client components**
   - Usa sempre Server Actions per operazioni admin

2. **Serializzazione Timestamp**
   - Converti sempre i Timestamp Firestore prima di passarli a client components

3. **Security Rules**
   - Server Actions usano Admin SDK (bypassano rules)
   - Client components usano Client SDK (rispettano rules)

4. **Environment Variables**
   - Non committare `.env.local`
   - V0 non ha accesso alle variabili d'ambiente
   - Configura manualmente in Vercel dopo il deploy

## 🔧 Setup Post-Import

Dopo aver importato in V0:

1. **Configura Environment Variables** (se deployi):
   - Vai su Vercel Dashboard
   - Aggiungi tutte le variabili da `.env.local`

2. **Deploy Firebase Rules**:
   - Deploya `firestore.indexes.json`
   - Deploya `storage.rules`

3. **Popola Database**:
   - Esegui `scripts/add-services.py`
   - Crea admin con `scripts/create-admin-quick.py`

## 📚 Risorse

- [V0 Documentation](https://v0.dev/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

---

**Nota**: V0 è uno strumento di generazione codice AI. Usa questo progetto come riferimento per capire i pattern e le convenzioni da seguire.

