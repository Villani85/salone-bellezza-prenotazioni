# 🔗 Guida Connessione a GitHub

Git è già configurato con:
- **Username**: Villani85
- **Email**: servizi.villani@gmail.com

## 🚀 Metodo 1: GitHub CLI (Più Semplice) - RACCOMANDATO

### Passo 1: Installa GitHub CLI

1. Scarica GitHub CLI per Windows da: https://cli.github.com/
2. Oppure usa winget (se disponibile):
   ```powershell
   winget install --id GitHub.cli
   ```
3. Riavvia il terminale dopo l'installazione

### Passo 2: Autenticati con GitHub

```powershell
gh auth login
```

Segui le istruzioni:
- Scegli **GitHub.com**
- Scegli **HTTPS**
- Scegli **Login with a web browser**
- Premi **Enter** per aprire il browser
- Autorizza GitHub CLI

### Passo 3: Crea e Collega il Repository

```powershell
# Crea il repository su GitHub e collega automaticamente
gh repo create salone-bellezza-prenotazioni --public --source=. --remote=origin --push
```

Questo comando:
- ✅ Crea il repository su GitHub
- ✅ Lo collega al repository locale
- ✅ Rinomina il branch in `main`
- ✅ Fa push di tutto il codice

## 🔧 Metodo 2: Manuale (Senza GitHub CLI)

### Passo 1: Crea Repository su GitHub

1. Vai su https://github.com/new
2. **Repository name**: `salone-bellezza-prenotazioni`
3. **Description**: "Sistema completo di gestione prenotazioni online per saloni di bellezza"
4. Scegli **Public** o **Private**
5. ⚠️ **NON** selezionare "Add a README file" (già presente)
6. Clicca **"Create repository"**

### Passo 2: Collega il Repository Locale

Dopo aver creato il repository, GitHub ti mostrerà le istruzioni. Esegui questi comandi:

```powershell
# Rinomina branch da master a main (GitHub usa main)
git branch -M main

# Aggiungi il remote (sostituisci USERNAME se diverso da Villani85)
git remote add origin https://github.com/Villani85/salone-bellezza-prenotazioni.git

# Verifica che il remote sia stato aggiunto
git remote -v
```

### Passo 3: Autenticazione per Push

GitHub non accetta più password, devi usare un **Personal Access Token**:

#### Crea un Personal Access Token:

1. Vai su: https://github.com/settings/tokens
2. Clicca **"Generate new token"** → **"Generate new token (classic)"**
3. Compila:
   - **Note**: "Salone Bellezza Project"
   - **Expiration**: Scegli una durata (es. 90 giorni)
   - **Scopes**: Seleziona almeno `repo` (tutti i permessi repository)
4. Clicca **"Generate token"**
5. **COPIA IL TOKEN** (lo vedrai solo una volta!)

#### Fai Push del Codice:

```powershell
# Fai push del codice
git push -u origin main
```

Quando richiesto:
- **Username**: `Villani85`
- **Password**: **Incolla il Personal Access Token** (non la password GitHub!)

## 🔐 Metodo 3: SSH (Più Sicuro, Una Volta Configurato)

### Passo 1: Genera Chiave SSH

```powershell
# Genera una nuova chiave SSH
ssh-keygen -t ed25519 -C "servizi.villani@gmail.com"

# Premi Enter per accettare il percorso predefinito
# Inserisci una passphrase (opzionale ma consigliata)
```

### Passo 2: Aggiungi Chiave SSH a GitHub

```powershell
# Mostra la chiave pubblica
cat ~/.ssh/id_ed25519.pub
```

1. Copia l'output completo
2. Vai su: https://github.com/settings/keys
3. Clicca **"New SSH key"**
4. **Title**: "Salone Bellezza - Windows"
5. **Key**: Incolla la chiave copiata
6. Clicca **"Add SSH key"**

### Passo 3: Collega Repository con SSH

```powershell
# Rinomina branch
git branch -M main

# Aggiungi remote con SSH
git remote add origin git@github.com:Villani85/salone-bellezza-prenotazioni.git

# Fai push
git push -u origin main
```

## ✅ Verifica Connessione

Dopo il push, verifica che tutto sia andato bene:

```powershell
# Controlla lo stato
git status

# Controlla i remote
git remote -v

# Controlla i commit
git log --oneline
```

Poi vai su: https://github.com/Villani85/salone-bellezza-prenotazioni

Dovresti vedere tutti i file del progetto!

## 🆘 Risoluzione Problemi

### Errore: "remote origin already exists"

```powershell
# Rimuovi il remote esistente
git remote remove origin

# Aggiungi di nuovo
git remote add origin https://github.com/Villani85/salone-bellezza-prenotazioni.git
```

### Errore: "authentication failed"

- Verifica che il Personal Access Token sia valido
- Assicurati di usare il token, non la password
- Controlla che il token abbia i permessi `repo`

### Errore: "branch 'main' does not exist"

```powershell
# Crea il branch main
git checkout -b main

# Oppure rinomina master
git branch -M main
```

## 📝 Comandi Utili Dopo la Connessione

```powershell
# Scarica modifiche da GitHub
git pull

# Aggiungi modifiche
git add .
git commit -m "Descrizione modifiche"
git push

# Crea un nuovo branch
git checkout -b nome-branch
git push -u origin nome-branch
```

---

**Raccomandazione**: Usa il **Metodo 1 (GitHub CLI)** se possibile, è il più semplice e sicuro!

