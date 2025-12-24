"""
Script di debug per verificare se le variabili d'ambiente vengono caricate correttamente
"""
import os
import sys
from pathlib import Path

# Fix encoding per Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

print("Verifica configurazione variabili d'ambiente Firebase Admin\n")

# Prova a caricare .env.local
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    print(f"Cercando .env.local in: {env_path}")
    
    if env_path.exists():
        print(f"[OK] File .env.local trovato!")
        load_dotenv(env_path)
        print(f"[OK] Variabili caricate dal file\n")
    else:
        print(f"[ERR] File .env.local NON trovato")
        print(f"   Verificando percorso corrente...")
        load_dotenv()  # Prova anche il percorso corrente
        if Path(".env.local").exists():
            print(f"[OK] File .env.local trovato nel percorso corrente\n")
        else:
            print(f"[ERR] File .env.local non trovato nemmeno qui\n")
except ImportError:
    print("⚠️  python-dotenv non installato - le variabili devono essere impostate manualmente\n")

# Verifica variabili
print("=" * 60)
print("Variabili d'ambiente Firebase Admin:")
print("=" * 60)

project_id = os.getenv('FIREBASE_ADMIN_PROJECT_ID')
client_email = os.getenv('FIREBASE_ADMIN_CLIENT_EMAIL')
private_key = os.getenv('FIREBASE_ADMIN_PRIVATE_KEY', '')

print(f"FIREBASE_ADMIN_PROJECT_ID: {'[OK] ' + project_id if project_id else '[ERR] NON IMPOSTATO'}")
print(f"FIREBASE_ADMIN_CLIENT_EMAIL: {'[OK] ' + client_email if client_email else '[ERR] NON IMPOSTATO'}")

if private_key:
    # Non mostrare la chiave completa per sicurezza
    key_preview = private_key[:50] + "..." if len(private_key) > 50 else private_key
    key_valid = private_key.startswith("-----BEGIN") and "-----END" in private_key
    if key_valid:
        print(f"FIREBASE_ADMIN_PRIVATE_KEY: [OK] Presente ({len(private_key)} caratteri)")
        print(f"  Preview: {key_preview}")
    else:
        print(f"FIREBASE_ADMIN_PRIVATE_KEY: [WARN] Presente ma formato potrebbe essere errato")
        print(f"  Preview: {key_preview}")
        print(f"  Dovrebbe iniziare con '-----BEGIN' e contenere '-----END'")
else:
    print(f"FIREBASE_ADMIN_PRIVATE_KEY: [ERR] NON IMPOSTATO")

# Opzionali
private_key_id = os.getenv('FIREBASE_ADMIN_PRIVATE_KEY_ID', '')
client_id = os.getenv('FIREBASE_ADMIN_CLIENT_ID', '')

print(f"\nVariabili opzionali:")
print(f"FIREBASE_ADMIN_PRIVATE_KEY_ID: {'[OK] ' + private_key_id if private_key_id else '[SKIP] Non impostato (opzionale)'}")
print(f"FIREBASE_ADMIN_CLIENT_ID: {'[OK] ' + client_id if client_id else '[SKIP] Non impostato (opzionale)'}")

print("\n" + "=" * 60)

if all([project_id, client_email, private_key]):
    print("[OK] Tutte le variabili obbligatorie sono presenti!")
    print("\nProva ora a eseguire lo script:")
    print("   python scripts/add-existing-user-as-admin.py")
else:
    print("[ERR] Alcune variabili obbligatorie mancano!")
    print("\nControlla il file .env.local nella root del progetto")
    print("Assicurati che contenga tutte le variabili necessarie")

