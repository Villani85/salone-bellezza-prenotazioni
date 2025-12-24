# 🚀 Guida Pubblicazione su GitHub

Il repository Git è stato inizializzato e il primo commit è stato creato. Segui questi passaggi per pubblicare su GitHub.

## 📋 Passi da Seguire

### 1. Crea un Repository su GitHub

1. Vai su [GitHub](https://github.com) e accedi al tuo account
2. Clicca sul pulsante **"+"** in alto a destra → **"New repository"**
3. Compila il form:
   - **Repository name**: `salone-bellezza-prenotazioni` (o un nome a tua scelta)
   - **Description**: "Sistema completo di gestione prenotazioni online per saloni di bellezza"
   - **Visibility**: Scegli **Public** o **Private**
   - ⚠️ **NON** inizializzare con README, .gitignore o licenza (già presenti)
4. Clicca **"Create repository"**

### 2. Collega il Repository Locale a GitHub

Dopo aver creato il repository, GitHub ti mostrerà le istruzioni. Esegui questi comandi nella directory del progetto:

```bash
# Aggiungi il remote (sostituisci USERNAME con il tuo username GitHub)
git remote add origin https://github.com/USERNAME/salone-bellezza-prenotazioni.git

# Verifica che il remote sia stato aggiunto
git remote -v
```

### 3. Rinomina il Branch (Opzionale ma Consigliato)

GitHub usa `main` come branch predefinito, mentre Git locale potrebbe usare `master`:

```bash
# Rinomina il branch corrente da master a main
git branch -M main
```

### 4. Fai Push del Codice

```bash
# Fai push del codice su GitHub
git push -u origin main
```

Se GitHub ti chiede credenziali:
- **Username**: Il tuo username GitHub
- **Password**: Usa un **Personal Access Token** (non la password)
  - Vai su GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Genera un nuovo token con permessi `repo`
  - Usa questo token come password

## ✅ Verifica

Dopo il push, vai sul repository su GitHub e verifica che tutti i file siano presenti.

## 🔄 Comandi Utili per il Futuro

### Aggiungere Modifiche

```bash
# Aggiungi tutti i file modificati
git add .

# Crea un commit
git commit -m "Descrizione delle modifiche"

# Fai push
git push
```

### Creare un Branch

```bash
# Crea e passa a un nuovo branch
git checkout -b nome-branch

# Fai push del nuovo branch
git push -u origin nome-branch
```

### Aggiornare da GitHub

```bash
# Scarica le modifiche da GitHub
git pull
```

## 📝 Note Importanti

1. **File Sensibili**: Assicurati che `.env.local` e altri file sensibili siano in `.gitignore` (già fatto ✅)

2. **Firebase Config**: Non committare mai:
   - File `.env*`
   - Chiavi private Firebase
   - Credenziali di servizio

3. **Documentazione**: Il README.md è già completo e pronto per GitHub

4. **License**: Se vuoi aggiungere una licenza, crea un file `LICENSE` nella root

## 🎯 Prossimi Passi

Dopo aver pubblicato su GitHub:

1. **Aggiungi Topics**: Vai su Settings → Topics e aggiungi:
   - `nextjs`
   - `typescript`
   - `firebase`
   - `tailwindcss`
   - `booking-system`

2. **Aggiungi Badges** (opzionale): Nel README.md puoi aggiungere badge per:
   - Build status
   - License
   - Version

3. **GitHub Actions** (opzionale): Configura CI/CD per:
   - Linting automatico
   - Build checks
   - Deploy automatico

4. **V0 Import**: Ora puoi importare il progetto in V0 seguendo `V0_IMPORT.md`

---

**Hai bisogno di aiuto?** Controlla la [documentazione GitHub](https://docs.github.com/en/get-started)

