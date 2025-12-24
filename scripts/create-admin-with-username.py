"""
Script per creare un utente admin con username e password
Esegui con: python scripts/create-admin-with-username.py
"""
import os
import sys
from pathlib import Path
from datetime import datetime

print("Inizializzazione Firebase Admin SDK...")

# Carica .env.local se esiste
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"[OK] File .env.local caricato da: {env_path}")
except ImportError:
    pass

# Importa Firebase Admin
try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth
except ImportError:
    print("[ERR] Errore: firebase-admin non installato")
    print("Installa con: pip install firebase-admin")
    sys.exit(1)

# Inizializza Firebase Admin
try:
    project_id = os.getenv('FIREBASE_ADMIN_PROJECT_ID')
    client_email = os.getenv('FIREBASE_ADMIN_CLIENT_EMAIL')
    private_key = os.getenv('FIREBASE_ADMIN_PRIVATE_KEY', '').replace('\\n', '\n')
    
    if not all([project_id, client_email, private_key]):
        print("[ERR] Errore: Variabili d'ambiente Firebase Admin mancanti")
        print("Assicurati di aver configurato:")
        print("- FIREBASE_ADMIN_PROJECT_ID")
        print("- FIREBASE_ADMIN_CLIENT_EMAIL")
        print("- FIREBASE_ADMIN_PRIVATE_KEY")
        sys.exit(1)
    
    cred_dict = {
        "type": "service_account",
        "project_id": project_id,
        "private_key_id": os.getenv('FIREBASE_ADMIN_PRIVATE_KEY_ID', ''),
        "private_key": private_key,
        "client_email": client_email,
        "client_id": os.getenv('FIREBASE_ADMIN_CLIENT_ID', ''),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email.replace('@', '%40')}",
    }
    
    cred = credentials.Certificate(cred_dict)
    
    # Inizializza solo se non e' gia inizializzato
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    print("[OK] Connesso a Firestore")
    
except Exception as e:
    print(f"[ERR] Errore di connessione: {e}")
    sys.exit(1)

# Richiedi informazioni utente
print("\n[Creazione utente admin con username]")
print("=" * 50)

username = input("Username (senza @): ").strip().lower()
if not username:
    print("[ERR] Username obbligatorio")
    sys.exit(1)

# Genera email basata su username (puoi cambiare il dominio)
email_domain = input("Dominio email (default: salone.local): ").strip() or "salone.local"
email = f"{username}@{email_domain}"

password = input("Password (minimo 6 caratteri): ").strip()
if len(password) < 6:
    print("[ERR] Password troppo corta (minimo 6 caratteri)")
    sys.exit(1)

name = input("Nome completo (opzionale): ").strip() or None

# Crea utente in Firebase Auth
try:
    print(f"\n[Creazione utente in Firebase Auth...]")
    user = auth.create_user(
        email=email,
        password=password,
        display_name=name,
        email_verified=False,
    )
    print(f"[OK] Utente creato con UID: {user.uid}")
    
    # Aggiungi alla collezione admins
    print(f"[Aggiunta a collezione admins...]")
    admin_ref = db.collection('admins').document(user.uid)
    admin_ref.set({
        'active': True,
        'email': email,
        'username': username,
        'name': name,
        'createdAt': firestore.SERVER_TIMESTAMP,
        'createdBy': 'script',
    })
    print(f"[OK] Admin aggiunto alla collezione admins")
    
    # Aggiungi mapping username -> email nella collezione adminUsers
    # Il document ID e' lo username stesso per lookup veloce
    print(f"[Creazione mapping username -> email...]")
    admin_user_ref = db.collection('adminUsers').document(username)
    admin_user_ref.set({
        'username': username,
        'email': email,
        'uid': user.uid,
        'active': True,
        'createdAt': firestore.SERVER_TIMESTAMP,
    })
    print(f"[OK] Mapping username creato (document ID = username)")
    
    print("\n" + "=" * 50)
    print("[OK] Riepilogo:")
    print(f"  - UID: {user.uid}")
    print(f"  - Username: {username}")
    print(f"  - Email: {email}")
    print(f"  - Nome: {name or 'N/A'}")
    print(f"  - Status: Attivo")
    print("\n[L'utente puo ora accedere con username e password!]")
    print(f"  Username: {username}")
    print(f"  Password: [quella inserita]")
    
except auth.EmailAlreadyExistsError:
    print(f"[ERR] Errore: L'email {email} e' gia registrata")
    print("\n[Suggerimento: Se vuoi rendere admin un utente esistente,")
    print("   usa questo script per aggiungerlo alla collezione admins:")
    print("\n   python scripts/add-existing-user-as-admin.py")
    sys.exit(1)
    
except Exception as e:
    print(f"[ERR] Errore durante la creazione: {e}")
    sys.exit(1)

