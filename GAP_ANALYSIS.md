# Gap Analysis: Stato Attuale vs Progetto Originale

## ✅ Cosa è già implementato

### Core Base
- ✅ Sistema base prenotazioni (wizard multi-step)
- ✅ Calcolo slot disponibili intelligente (considera buffer, risorse, conflitti)
- ✅ Dashboard admin base (statistiche giornaliere, gestione prenotazioni)
- ✅ Autenticazione admin con verifica ruoli
- ✅ CRUD servizi base (ma manca categoria, descrizione, prodotti)
- ✅ Server Actions con validazione robusta
- ✅ Logging strutturato
- ✅ Indici Firestore ottimizzati

### UI/UX
- ✅ Interfaccia moderna e responsive
- ✅ Wizard prenotazione multi-step
- ✅ Componenti UI con shadcn/ui

---

## ❌ Cosa manca completamente

### 1. REGISTRAZIONE CLIENTE OBBLIGATORIA ⚠️ CRITICO

**Stato attuale:** 
- Prenotazioni con `userId: "anonymous"`
- Nessuna registrazione cliente

**Cosa serve:**
- Flusso registrazione prima della prenotazione
- Dati obbligatori: Nome, Cognome, Email, Conferma Email, Genere
- Dati opzionali: Data nascita (mese/giorno), CAP/Città, Preferenza oraria, Canale acquisizione, Interessi (checkbox)
- Verifica email (double opt-in)
- Collezione `customers` in Firestore

**Priorità:** 🔴 ALTA

---

### 2. MULTI-SALONE E LINK PUBBLICI ⚠️ CRITICO

**Stato attuale:**
- Solo `/book` hardcoded
- Nessun concetto di "salone"

**Cosa serve:**
- Modello `Salon` con: nome, slug, contatti, indirizzo, configurazione
- Route dinamiche `/book/[salonSlug]`
- Link pubblico univoco generato per ogni salone
- Ogni salone ha la sua configurazione

**Priorità:** 🔴 ALTA

---

### 3. CONFIGURAZIONE SALONE COMPLETA

**Stato attuale:**
- Solo config base: orari, timeStep, resources, bufferTime

**Cosa serve:**
- Nome salone
- Contatti (email, telefono)
- Indirizzo completo
- Giorni di chiusura / Ferie (array date)
- Link pubblico generato automaticamente

**Priorità:** 🟡 MEDIA

---

### 4. STATI PRENOTAZIONE AVANZATI

**Stato attuale:**
- Solo: `PENDING`, `CONFIRMED`, `REJECTED`

**Cosa serve:**
- `ALTERNATIVE_PROPOSED` - Admin ha proposto slot alternativi
- Campo `alternativeSlots` (array di 2-3 slot)
- Campo `rejectionReason` (opzionale, motivo rifiuto)
- Campo `proposedAlternatives` (array date/time)

**Priorità:** 🟡 MEDIA

---

### 5. CRM LEGGERO (GESTIONE CLIENTI)

**Stato attuale:**
- Nessuna gestione clienti
- Nessun profilo cliente

**Cosa serve:**
- Lista clienti in admin (`/admin/customers`)
- Profilo cliente completo:
  - Dati registrazione
  - Storico prenotazioni
  - Tag automatici (basati su interessi, servizi acquistati)
  - Note interne (admin)
  - Segmentazione automatica
- Filtri e ricerca clienti

**Priorità:** 🟡 MEDIA

---

### 6. SEGMENTAZIONE CLIENTI

**Stato attuale:**
- Nessuna segmentazione

**Cosa serve:**
- Tag automatici:
  - Per servizio acquistato ("Colore", "Manicure ricorrente", "Taglio uomo")
  - Per interesse ("Interessato: Pulizia viso")
  - Per frequenza ("Cliente frequente", "Cliente perso 60gg")
  - Per preferenza oraria ("Weekend", "Sera")
  - Per canale acquisizione
- Sistema di filtri per campagne

**Priorità:** 🟢 BASSA (post MVP)

---

### 7. DASHBOARD MARKETING

**Stato attuale:**
- Solo dashboard operativa base

**Cosa serve:**
- **Funnel**: visite link → registrazioni → richieste → conferme
- **Heatmap**: richieste per giorno/ora
- **Trend**: richieste per servizio nel tempo
- **Insight testuali**: suggerimenti automatici
- **Segmenti pronti**: filtri rapidi per campagne
- **KPI marketing**: tasso conversione, acquisizione, retention

**Priorità:** 🟢 BASSA (post MVP)

---

### 8. CATALOGO PRODOTTI

**Stato attuale:**
- Solo servizi (category mancante anche qui)

**Cosa serve:**
- Collezione `products` separata da `services`
- Prodotti con: nome, categoria, prezzo, descrizione, attivo/inattivo
- Collegamento prodotti a servizi (opzionale)
- Interessi clienti possono includere prodotti

**Priorità:** 🟢 BASSA (opzionale)

---

### 9. EMAIL E NOTIFICHE (ReSend)

**Stato attuale:**
- Nessuna email

**Cosa serve:**
- Integrazione ReSend
- Template email:
  - Verifica email (registrazione)
  - Richiesta ricevuta
  - Conferma prenotazione
  - Rifiuto prenotazione (con motivo)
  - Alternativa proposta
  - Reminder 24h prima
- Log email (`EmailLog` collection)
- Configurazione template admin

**Priorità:** 🟡 MEDIA (fondamentale per UX)

---

### 10. PROPOSTA ALTERNATIVE

**Stato attuale:**
- Solo approve/reject

**Cosa serve:**
- Admin può proporre 2-3 slot alternativi
- Stato `ALTERNATIVE_PROPOSED`
- Cliente può accettare uno slot o rifiutare
- UI per visualizzare e selezionare alternative

**Priorità:** 🟡 MEDIA

---

### 11. CALENDARIO SETTIMANALE ADMIN

**Stato attuale:**
- Nessun calendario visivo

**Cosa serve:**
- Vista calendario settimanale in admin
- Visualizzazione prenotazioni per giorno/ora
- Drag & drop (opzionale)
- Filtri per servizio, cliente, status

**Priorità:** 🟡 MEDIA

---

### 12. SERVIZI COMPLETI

**Stato attuale:**
- Servizi base: nome, durata, prezzo, active

**Cosa serve:**
- Campo `category` (Capelli, Estetica, Unghie, Depilazione)
- Campo `description` (testo)
- Campo `image` (opzionale)
- Catalogo pre-impostato (esempi reali)

**Priorità:** 🟡 MEDIA

---

### 13. GESTIONE FERIE E CHIUSURE

**Stato attuale:**
- Nessuna gestione ferie

**Cosa serve:**
- Array `closedDates` in configurazione salone
- Array `closedDaysOfWeek` (es. [0] = domenica sempre chiusa)
- Calendario intelligente esclude automaticamente questi giorni

**Priorità:** 🟡 MEDIA

---

### 14. DASHBOARD OPERATIVA COMPLETA

**Stato attuale:**
- Solo statistiche base oggi

**Cosa serve:**
- "Da quanto tempo" per richieste in attesa
- Tasso conferma vs rifiuto (grafici)
- Motivi principali di rifiuto (se inseriti)
- Trend nel tempo

**Priorità:** 🟢 BASSA (nice to have)

---

### 15. ROUTE E PAGINE MANCANTI

**Stato attuale:**
- `/` (home)
- `/book` (prenotazione)
- `/admin/login`
- `/admin/dashboard`

**Cosa serve:**

**Cliente:**
- `/book/[salonSlug]` (landing prenotazione con info salone)
- `/register` (registrazione cliente obbligatoria)
- `/booking/new` (creazione nuova prenotazione)
- `/booking/status` (stato richiesta/prenotazione)
- `/booking/[id]/alternatives` (scegli tra alternative)

**Admin:**
- `/admin/calendar` (calendario settimanale)
- `/admin/requests` (gestione richieste avanzata)
- `/admin/customers` (CRM clienti)
- `/admin/customers/[id]` (profilo cliente)
- `/admin/catalog` (servizi + prodotti)
- `/admin/marketing` (dashboard marketing + segmenti)
- `/admin/settings` (configurazione salone completa)

**Priorità:** Varie (vedi sopra)

---

## 📊 Priorità di Implementazione

### FASE 1 - MVP Core (2-3 settimane)
1. ✅ Registrazione cliente obbligatoria
2. ✅ Multi-salone + link pubblici
3. ✅ Configurazione salone completa
4. ✅ Servizi completi (categoria, descrizione)
5. ✅ Stati prenotazione avanzati + proposta alternative

### FASE 2 - CRM e Marketing Base (1-2 settimane)
6. ✅ CRM leggero (lista clienti, profilo)
7. ✅ Segmentazione base (tag automatici)
8. ✅ Calendario settimanale admin
9. ✅ Dashboard operativa migliorata

### FASE 3 - Email e Notifiche (1 settimana)
10. ✅ Integrazione ReSend
11. ✅ Template email base
12. ✅ Reminder automatici

### FASE 4 - Marketing Avanzato (1-2 settimane)
13. ✅ Dashboard marketing completa
14. ✅ Funnel e heatmap
15. ✅ Insight automatici
16. ✅ Campagne email avanzate

### FASE 5 - Prodotti e Extra (opzionale)
17. ⏸️ Catalogo prodotti
18. ⏸️ Drag & drop calendario
19. ⏸️ Export dati

---

## 🎯 Prossimi Passi

**Raccomandazione:**
1. Implementare FASE 1 completa (MVP Core)
2. Aggiungere email base (FASE 3, solo conferme/rifiuto)
3. Poi espandere con CRM e marketing

Vuoi che proceda con l'implementazione della FASE 1?

