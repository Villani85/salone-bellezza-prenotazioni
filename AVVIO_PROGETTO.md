# 🚀 Guida Completa all'Avvio del Progetto

## Prerequisiti

- **Node.js 18+** e **pnpm** (o npm/yarn)
- **Python 3.10+** (per script database)
- **Account Firebase** configurato
- **ReSend API Key** (opzionale, per email)

---

## 📋 Passo 1: Installazione Dipendenze

```bash
# Installa dipendenze Node.js
pnpm install
# oppure
npm install

# Installa dipendenze Python (per script)
pip install firebase-admin python-dotenv
```

---

## 📋 Passo 2: Configurazione Firebase

### 2.1 Crea Progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuovo progetto (o usa uno esistente)
3. Abilita **Firestore Database** (Modalità produzione o test)
4. Abilita **Firebase Authentication** (Email/Password)

### 2.2 Configura Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto (`D:\salone\.env.local`):

```env
# Firebase Client Config (per Next.js)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (per script Python)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ReSend (opzionale, per email)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Salone <noreply@salone.it>
```

**Come ottenere le credenziali Firebase Admin:**

1. Vai su Firebase Console → **Impostazioni progetto** → **Account di servizio**
2. Clicca su **Genera nuova chiave privata**
3. Scarica il file JSON
4. Estrai i valori dal JSON:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (mantieni tutto incluso `-----BEGIN` e `-----END`)

**⚠️ IMPORTANTE per Windows:**
- La `FIREBASE_ADMIN_PRIVATE_KEY` deve essere tra virgolette doppie `""`
- I `\n` devono essere presenti (non rimuoverli)
- Se hai problemi, prova a sostituire `\n` con newline reali

---

## 📋 Passo 3: Configurazione Firestore

### 3.1 Deploya gli Indici

Deploya il file `firestore.indexes.json`:

```bash
# Se hai Firebase CLI installato
firebase deploy --only firestore:indexes

# Oppure manualmente:
# Vai su Firebase Console → Firestore → Indexes → Import
# Seleziona il file firestore.indexes.json
```

### 3.2 Configura Security Rules

Vai su Firebase Console → Firestore → Rules e inserisci:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Settings
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Services
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Bookings
    match /bookings/{bookingId} {
      allow create: if request.resource.data.status == "PENDING";
      allow read: if request.auth != null && (
        resource.data.customerId == request.auth.uid ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
      allow update: if request.auth != null &&
                      exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Customers
    match /customers/{customerId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == customerId ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }
    
    // Admins
    match /admins/{adminId} {
      allow read, write: if request.auth != null &&
                           exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Salons
    match /salons/{salonId} {
      allow read: if true;
      allow write: if request.auth != null &&
                     exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Email Logs
    match /emailLogs/{logId} {
      allow read, write: if request.auth != null &&
                           exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

---

## 📋 Passo 4: Popola il Database

### 4.1 Verifica Configurazione

```bash
python scripts/check-env.py
```

Dovresti vedere tutte le variabili caricate correttamente.

### 4.2 Popola Dati di Esempio

```bash
python scripts/seed-database.py
```

Questo creerà:
- Configurazione salone default
- Servizi di esempio
- Alcune prenotazioni di test

### 4.3 Crea Primo Utente Admin

**Opzione A: Crea nuovo utente admin**

```bash
python scripts/create-admin.py
```

Inserisci:
- Email
- Password (minimo 6 caratteri)
- Nome (opzionale)

**Opzione B: Rendi admin un utente esistente**

Se hai già creato un utente in Firebase Auth:

```bash
python scripts/add-existing-user-as-admin.py
```

Inserisci l'email dell'utente esistente.

---

## 📋 Passo 5: Avvia l'Applicazione

### Sviluppo

```bash
pnpm dev
# oppure
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

### Produzione

```bash
# Build
pnpm build
# oppure
npm run build

# Avvia
pnpm start
# oppure
npm start
```

---

## ✅ Verifica che Tutto Funzioni

### 1. Homepage
- Visita `http://localhost:3000`
- Dovresti vedere la landing page

### 2. Prenotazione
- Clicca su "Prenota ora"
- Dovresti vedere il wizard di prenotazione

### 3. Admin Dashboard
- Vai su `http://localhost:3000/admin/login`
- Accedi con l'account admin creato
- Dovresti vedere la dashboard con statistiche

### 4. Gestione
- Dashboard: `/admin/dashboard` - Statistiche e prenotazioni in attesa
- Calendario: `/admin/calendar` - Vista settimanale
- Clienti: `/admin/customers` - Lista clienti
- Impostazioni: `/admin/settings` - Configurazione salone

---

## 🔧 Troubleshooting

### Problema: "Variabili d'ambiente non trovate"

**Soluzione:**
1. Verifica che il file `.env.local` esista nella root (`D:\salone\.env.local`)
2. Esegui `python scripts/check-env.py` per verificare
3. Assicurati che le variabili siano scritte correttamente (senza spazi prima/dopo `=`)

### Problema: "Service account info was not in the expected format"

**Soluzione:**
1. Verifica che `FIREBASE_ADMIN_PRIVATE_KEY` includa `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`
2. Assicurati che i `\n` siano presenti nella chiave
3. Se necessario, sostituisci manualmente `\\n` con newline reali nel file `.env.local`

### Problema: "Errore di connessione Firebase"

**Soluzione:**
1. Verifica che Firestore sia abilitato in Firebase Console
2. Controlla che le credenziali siano corrette
3. Verifica che il progetto Firebase sia attivo

### Problema: "Nessun servizio disponibile"

**Soluzione:**
1. Esegui `python scripts/seed-database.py` per popolare i servizi
2. Verifica in Firebase Console → Firestore che esista la collezione `services`

### Problema: Script Python non trova .env.local

**Soluzione:**
1. Verifica che il file sia esattamente `.env.local` (non `.env.local.txt`)
2. Verifica che sia nella root del progetto (`D:\salone\.env.local`)
3. Esegui `python scripts/check-env.py` per debug

---

## 📚 Comandi Utili

```bash
# Verifica variabili d'ambiente
python scripts/check-env.py

# Popola database
python scripts/seed-database.py

# Crea admin
python scripts/create-admin.py

# Rendi admin utente esistente
python scripts/add-existing-user-as-admin.py

# Avvia dev server
pnpm dev

# Build produzione
pnpm build

# Test linting
pnpm lint
```

---

## 🎯 Checklist Avvio

- [ ] Node.js e pnpm installati
- [ ] Python 3.10+ installato
- [ ] Dipendenze Node.js installate (`pnpm install`)
- [ ] Dipendenze Python installate (`pip install firebase-admin python-dotenv`)
- [ ] Progetto Firebase creato
- [ ] Firestore Database abilitato
- [ ] Firebase Authentication abilitato
- [ ] File `.env.local` configurato con tutte le variabili
- [ ] Indici Firestore deployati
- [ ] Security Rules configurate
- [ ] Database popolato (`python scripts/seed-database.py`)
- [ ] Utente admin creato
- [ ] Applicazione avviata (`pnpm dev`)
- [ ] Testato login admin
- [ ] Testata prenotazione

---

## 🚀 Pronto!

Dopo aver completato tutti i passaggi, il progetto dovrebbe essere completamente funzionante!

Per supporto, consulta:
- `README.md` - Documentazione generale
- `GAP_ANALYSIS.md` - Analisi funzionalità
- `IMPLEMENTATION_SUMMARY.md` - Riepilogo implementazione
- `FINAL_IMPLEMENTATION_STATUS.md` - Status completo

