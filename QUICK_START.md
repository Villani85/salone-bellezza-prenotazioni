# ⚡ Quick Start - Avvio Rapido

## 🎯 Guida Veloce (5 minuti)

### 1. Installa Dipendenze

```bash
npm install
```

### 2. Verifica Configurazione Firebase

Il file `.env.local` dovrebbe già esistere. Verifica che funzioni:

```bash
python scripts/check-env.py
```

Se vedi tutti `[OK]`, passa al prossimo passo!

### 3. Popola il Database

```bash
python scripts/seed-database.py
```

Questo crea:
- Configurazione salone
- Servizi di esempio
- Dati di test

### 4. Crea Utente Admin

**Se hai già un utente in Firebase Auth:**
```bash
python scripts/add-existing-user-as-admin.py
```

**Se devi crearne uno nuovo:**
```bash
python scripts/create-admin.py
```

### 5. Avvia l'Applicazione

```bash
npm run dev
```

Apri il browser su: **http://localhost:3000**

---

## ✅ Verifica

1. **Homepage**: `http://localhost:3000` ✅
2. **Admin Login**: `http://localhost:3000/admin/login` ✅
3. **Dashboard**: `http://localhost:3000/admin/dashboard` ✅

---

## 🔧 Se Qualcosa Non Funziona

### Problema con Script Python

Se vedi errore "token_uri missing":
- Lo script è già stato aggiornato con tutti i campi necessari
- Verifica che stai usando la versione aggiornata
- Prova: `python scripts/check-env.py` per vedere se le variabili sono caricate

### Problema con .env.local

- Il file deve essere esattamente `.env.local` (non `.env.local.txt`)
- Deve essere nella root: `D:\salone\.env.local`
- Verifica con: `python scripts/check-env.py`

### Problema Private Key

Se la private key non funziona:
- Deve essere tra virgolette doppie `""`
- Deve includere `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`
- I `\n` devono essere presenti

---

## 📚 Documentazione Completa

Per la guida dettagliata, vedi: **`AVVIO_PROGETTO.md`**

