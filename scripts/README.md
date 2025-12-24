# Script Python per Gestione Database

Questi script utilizzano Firebase Admin SDK per gestire il database Firestore.

## Prerequisiti

```bash
pip install firebase-admin python-dotenv
```

## Configurazione

Crea un file `.env.local` nella root del progetto (`D:\salone\.env.local`) con le seguenti variabili:

```env
# Firebase Admin SDK - Service Account
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Opzionali (ma consigliati se disponibili nel JSON del service account)
FIREBASE_ADMIN_PRIVATE_KEY_ID=key-id-here
FIREBASE_ADMIN_CLIENT_ID=client-id-here
```

### Come ottenere le credenziali

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il tuo progetto
3. Vai su **Impostazioni progetto** → **Account di servizio**
4. Clicca su **Genera nuova chiave privata**
5. Scarica il file JSON

Il JSON contiene tutti i campi necessari. Puoi estrarli così:

- `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
- `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (mantieni i `\n`)
- `private_key_id` → `FIREBASE_ADMIN_PRIVATE_KEY_ID` (opzionale)
- `client_id` → `FIREBASE_ADMIN_CLIENT_ID` (opzionale)

**IMPORTANTE**: 
- Per `FIREBASE_ADMIN_PRIVATE_KEY`, copia TUTTO il valore incluso `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`
- In Windows, potrebbe essere necessario mantenere i `\n` letterali oppure usare virgolette doppie nel file `.env.local`

## Script Disponibili

### 1. `seed-database.py`
Popola il database con dati di esempio (configurazione, servizi, prenotazioni).

```bash
python scripts/seed-database.py
```

### 2. `create-admin.py`
Crea un nuovo utente admin (crea sia l'utente in Firebase Auth che il documento in `admins`).

```bash
python scripts/create-admin.py
```

### 3. `add-existing-user-as-admin.py`
Aggiunge un utente esistente (già presente in Firebase Auth) alla collezione `admins`.

```bash
python scripts/add-existing-user-as-admin.py
```

## Troubleshooting

### Errore: "Variabili d'ambiente Firebase Admin mancanti"
- Verifica che il file `.env.local` esista nella root del progetto
- Controlla che le variabili siano scritte correttamente (senza spazi prima/dopo `=`)
- Assicurati di aver salvato il file

### Errore: "Service account info was not in the expected format"
- Verifica che `FIREBASE_ADMIN_PRIVATE_KEY` includa `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`
- Assicurati che i `\n` siano presenti (oppure sostituisci manualmente con newline reali)
- Prova a copiare il valore esatto dal JSON del service account

### Errore: "Failed to initialize a certificate credential"
- Verifica che `FIREBASE_ADMIN_CLIENT_EMAIL` sia corretto
- Controlla che il formato del private key sia corretto
- Se hai `FIREBASE_ADMIN_PRIVATE_KEY_ID` e `FIREBASE_ADMIN_CLIENT_ID`, aggiungili al `.env.local`

## Note

- Gli script caricano automaticamente `.env.local` dalla root del progetto
- I campi `token_uri`, `auth_uri`, ecc. vengono aggiunti automaticamente se non presenti
- In caso di problemi, puoi anche usare il file JSON direttamente invece delle variabili d'ambiente

