# 🚀 Pubblica il Progetto su GitHub - ISTRUZIONI RAPIDE

## ✅ Preparazione Completata

Il progetto è pronto per essere pubblicato. Ho già:
- ✅ Rinominato il branch in `main`
- ✅ Preparato tutti i file
- ✅ Creato 3 commit

## 📋 Passi da Seguire (5 minuti)

### Passo 1: Crea il Repository su GitHub

1. **Vai su**: https://github.com/new
2. **Repository name**: `salone-bellezza-prenotazioni`
3. **Description**: "Sistema completo di gestione prenotazioni online per saloni di bellezza"
4. **Visibility**: Scegli **Public** o **Private**
5. ⚠️ **IMPORTANTE**: **NON** selezionare:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Clicca **"Create repository"**

### Passo 2: Collega e Pubblica

Dopo aver creato il repository, GitHub ti mostrerà una pagina con istruzioni. 

**IGNORA** quelle istruzioni e usa invece questi comandi (già preparati per te):

```powershell
# Collega il repository locale a GitHub
git remote add origin https://github.com/Villani85/salone-bellezza-prenotazioni.git

# Verifica che sia stato aggiunto
git remote -v

# Pubblica tutto il codice
git push -u origin main
```

### Passo 3: Autenticazione

Quando esegui `git push`, ti chiederà:
- **Username**: `Villani85`
- **Password**: **NON usare la password GitHub!**

Devi usare un **Personal Access Token**:

1. Vai su: https://github.com/settings/tokens
2. Clicca **"Generate new token"** → **"Generate new token (classic)"**
3. Compila:
   - **Note**: "Salone Bellezza Project"
   - **Expiration**: Scegli (es. 90 giorni)
   - **Scopes**: Seleziona **`repo`** (tutti i permessi repository)
4. Clicca **"Generate token"**
5. **COPIA IL TOKEN** (lo vedrai solo una volta!)
6. Quando Git chiede la password, **incolla il token** (non la password)

## ✅ Verifica

Dopo il push, vai su:
https://github.com/Villani85/salone-bellezza-prenotazioni

Dovresti vedere tutti i file del progetto!

## 🆘 Problemi?

### "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/Villani85/salone-bellezza-prenotazioni.git
```

### "authentication failed"
- Verifica di usare il Personal Access Token, non la password
- Assicurati che il token abbia i permessi `repo`

---

**Tempo stimato**: 5 minuti
**Difficoltà**: Facile

