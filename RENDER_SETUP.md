# 🚀 Configurazione Render - Guida Completa

## ✅ Configurazione Base (Già Corretta)

- **Source Code**: `Villani85/salone-bellezza-prenotazioni` ✅
- **Branch**: `main` ✅
- **Build Command**: `pnpm install --no-frozen-lockfile && pnpm run build` ✅
- **Start Command**: `pnpm start` ✅
- **Region**: Oregon (US West) ✅

## ⚠️ IMPORTANTE: Variabili d'Ambiente

Devi aggiungere **TUTTE** queste variabili d'ambiente in Render:

### Firebase Client SDK (NEXT_PUBLIC_*)

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firebase Admin SDK

```
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

⚠️ **IMPORTANTE per FIREBASE_ADMIN_PRIVATE_KEY**:
- Deve essere tra virgolette doppie `""`
- I `\n` devono essere presenti (non rimuoverli)
- Copia l'intera chiave incluso `-----BEGIN` e `-----END`

### Email (Opzionale ma Consigliato)

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Salone <noreply@salone.it>
NEXT_PUBLIC_APP_URL=https://your-render-url.onrender.com
```

## 📋 Come Aggiungere le Variabili

1. Nella pagina di configurazione Render, vai a **"Environment Variables"**
2. Clicca **"Add Environment Variable"**
3. Aggiungi una variabile alla volta:
   - **Key**: Il nome della variabile (es. `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value**: Il valore della variabile
4. Ripeti per tutte le variabili sopra

## ⚠️ Instance Type: Free vs Paid

### Free Instance (Attuale)
- ✅ Funziona per test
- ❌ **Spins down dopo inattività** (primo accesso lento)
- ❌ Limiti di memoria (512 MB)
- ❌ Nessun SSH access

### Consigliato: Starter ($7/mese)
- ✅ Sempre attivo (zero downtime)
- ✅ Più memoria (512 MB ma più stabile)
- ✅ SSH access per debugging
- ✅ Migliore per produzione

**Per sviluppo/test**: Free va bene
**Per produzione**: Consiglia Starter o superiore

## 🔧 Configurazioni Aggiuntive

### Auto-Deploy
- ✅ Dovrebbe essere abilitato di default
- Verifica che sia attivo per il branch `main`

### Health Check (Opzionale)
Puoi aggiungere un health check endpoint:
- **Path**: `/api/health`
- Render controllerà automaticamente questo endpoint

## 🚨 Problemi Comuni

### Build Fallisce
1. Verifica che tutte le variabili d'ambiente siano impostate
2. Controlla i log di build per errori specifici
3. Assicurati che `FIREBASE_ADMIN_PRIVATE_KEY` abbia i `\n` corretti

### App Non Si Avvia
1. Verifica che `PORT` sia impostato (Render lo imposta automaticamente)
2. Controlla i log runtime per errori
3. Verifica che Firebase Admin SDK sia configurato correttamente

### Errori Firebase
1. Verifica che tutte le variabili `NEXT_PUBLIC_FIREBASE_*` siano impostate
2. Controlla che `FIREBASE_ADMIN_*` siano corrette
3. Verifica che il progetto Firebase sia attivo

## 📝 Checklist Pre-Deploy

- [ ] Tutte le variabili d'ambiente Firebase Client sono impostate
- [ ] Tutte le variabili d'ambiente Firebase Admin sono impostate
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY` ha i `\n` corretti
- [ ] `NEXT_PUBLIC_APP_URL` è impostato (se usi email)
- [ ] `RESEND_API_KEY` è impostato (se usi email)
- [ ] Instance type è appropriato (Free per test, Starter+ per produzione)
- [ ] Auto-deploy è abilitato

## 🔗 Link Utili

- [Render Docs - Environment Variables](https://render.com/docs/environment-variables)
- [Render Docs - Next.js](https://render.com/docs/deploy-nextjs)
- [Firebase Console](https://console.firebase.google.com/)

---

**Dopo aver aggiunto tutte le variabili, clicca "Deploy web service" e attendi il build!**

