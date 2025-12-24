# 📋 Come Aggiungere Variabili d'Ambiente su Render

Purtroppo non posso accedere direttamente al tuo account Render, ma posso aiutarti a preparare tutto.

## 🚀 Metodo Veloce

### Opzione 1: Usa il file render.yaml (Raccomandato)

Ho creato il file `render.yaml` che Render può leggere automaticamente.

1. **Nel dashboard Render**, quando crei/modifichi il servizio:
   - Vai su **"Advanced"**
   - Cerca **"Blueprint"** o **"Import from YAML"**
   - Oppure usa **"Generate Blueprint"** per vedere la configurazione

2. **Oppure aggiungi manualmente** (più semplice):
   - Vai su **"Environment Variables"**
   - Clicca **"Add from .env"** se disponibile
   - Oppure aggiungi manualmente (vedi sotto)

### Opzione 2: Aggiungi Manualmente

1. **Apri il tuo file `.env.local`** nella cartella del progetto

2. **Per ogni variabile**, vai su Render → Environment Variables → Add Environment Variable

3. **Copia queste variabili** dal tuo `.env.local`:

#### Firebase Client SDK
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

#### Firebase Admin SDK
```
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

⚠️ **IMPORTANTE per FIREBASE_ADMIN_PRIVATE_KEY**:
- Deve essere tra virgolette doppie `""`
- Mantieni i `\n` (non rimuoverli)
- Esempio: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

#### Email (Opzionale)
```
RESEND_API_KEY
EMAIL_FROM
NEXT_PUBLIC_APP_URL
```

**Nota per NEXT_PUBLIC_APP_URL**: 
- Aggiungila DOPO il primo deploy
- Usa l'URL che Render ti darà (es. `https://salone-bellezza-prenotazioni-6.onrender.com`)

## 📝 Checklist

- [ ] Aperto `.env.local`
- [ ] Aggiunto tutte le variabili `NEXT_PUBLIC_FIREBASE_*`
- [ ] Aggiunto `FIREBASE_ADMIN_PROJECT_ID`
- [ ] Aggiunto `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] Aggiunto `FIREBASE_ADMIN_PRIVATE_KEY` (con virgolette e `\n`)
- [ ] Aggiunto `RESEND_API_KEY` (se lo usi)
- [ ] Aggiunto `EMAIL_FROM` (se lo usi)
- [ ] Aggiunto `NEXT_PUBLIC_APP_URL` (DOPO il primo deploy)

## ✅ Dopo aver aggiunto tutte le variabili

1. Clicca **"Deploy web service"**
2. Attendi il build (può richiedere 5-10 minuti)
3. Se il build fallisce, controlla i log per vedere quale variabile manca

## 🆘 Problemi?

Se il build fallisce:
1. Controlla i log di build su Render
2. Verifica che tutte le variabili siano state aggiunte
3. Assicurati che `FIREBASE_ADMIN_PRIVATE_KEY` abbia le virgolette e i `\n`

---

**Non posso accedere direttamente a Render, ma con queste istruzioni dovresti riuscire facilmente!** 🚀

