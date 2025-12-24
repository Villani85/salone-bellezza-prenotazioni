# 🔧 Fix Errore EPERM su Windows

## Problema

Next.js non può rinominare file nella cartella `.next`:
```
Error: EPERM: operation not permitted, rename ...
```

## Cause Comuni

1. **File bloccati da antivirus/Windows Defender**
2. **File Explorer aperto nella directory**
3. **Altro processo Node.js in esecuzione**
4. **Permessi insufficienti**

## ✅ Soluzioni (in ordine di priorità)

### 1. Elimina la cartella .next e riavvia

```powershell
# Elimina cartella .next
Remove-Item -Recurse -Force .next

# Riavvia il server
npm run dev
```

### 2. Chiudi tutti i processi Node.js

```powershell
# Vedi processi Node attivi
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Chiudi tutti i processi Node (ATTENZIONE: chiude tutti i Node)
Stop-Process -Name node -Force
```

### 3. Chiudi File Explorer

Se hai File Explorer aperto nella cartella `D:\salone`, chiudilo.

### 4. Esegui PowerShell come Amministratore

1. Clicca destro su PowerShell
2. Seleziona "Esegui come amministratore"
3. Naviga a `D:\salone`
4. Esegui `npm run dev`

### 5. Aggiungi eccezione in Windows Defender

1. Vai su **Windows Security** → **Virus & threat protection**
2. Clicca su **Manage settings**
3. Scrolla fino a **Exclusions**
4. Aggiungi `D:\salone` alle esclusioni

### 6. Usa WSL (Windows Subsystem for Linux)

Se hai WSL installato, puoi eseguire il progetto da lì:

```bash
cd /mnt/d/salone
npm install
npm run dev
```

## 🚀 Soluzione Rapida (Consigliata)

```powershell
# 1. Elimina .next
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 2. Chiudi processi Node esistenti
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# 3. Attendi 2 secondi
Start-Sleep -Seconds 2

# 4. Riavvia
npm run dev
```

## 📝 Script PowerShell Automatico

Crea un file `start-dev.ps1`:

```powershell
# start-dev.ps1
Write-Host "Pulizia cartella .next..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "Chiusura processi Node esistenti..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host "Avvio server di sviluppo..." -ForegroundColor Green
npm run dev
```

Esegui con:
```powershell
.\start-dev.ps1
```

