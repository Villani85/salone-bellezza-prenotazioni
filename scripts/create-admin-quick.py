"""
Script rapido per creare un admin con username e password
Uso: python scripts/create-admin-quick.py <username> <password> [nome]
Esempio: python scripts/create-admin-quick.py admin password123 "Admin User"
"""
import os
import sys
from pathlib import Path

print("Inizializzazione Firebase Admin SDK...")

# Carica .env.local
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"[OK] File .env.local caricato")
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
    
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    print("[OK] Connesso a Firestore")
    
except Exception as e:
    print(f"[ERR] Errore di connessione: {e}")
    sys.exit(1)

# Leggi parametri da command line
if len(sys.argv) < 3:
    print("\nUso: python scripts/create-admin-quick.py <username> <password> [nome]")
    print("Esempio: python scripts/create-admin-quick.py admin password123")
    sys.exit(1)

username = sys.argv[1].strip().lower()
password = sys.argv[2].strip()
name = sys.argv[3] if len(sys.argv) > 3 else None

if len(password) < 6:
    print("[ERR] Password troppo corta (minimo 6 caratteri)")
    sys.exit(1)

email_domain = "salone.local"
email = f"{username}@{email_domain}"

# Crea utente
try:
    print(f"\n[Creazione utente admin...]")
    print(f"  Username: {username}")
    print(f"  Email: {email}")
    
    user = auth.create_user(
        email=email,
        password=password,
        display_name=name,
        email_verified=False,
    )
    print(f"[OK] Utente creato con UID: {user.uid}")
    
    # Aggiungi alla collezione admins
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
    
    # Aggiungi mapping username -> email
    admin_user_ref = db.collection('adminUsers').document(username)
    admin_user_ref.set({
        'username': username,
        'email': email,
        'uid': user.uid,
        'active': True,
        'createdAt': firestore.SERVER_TIMESTAMP,
    })
    print(f"[OK] Mapping username creato")
    
    print("\n" + "=" * 50)
    print("[OK] Admin creato con successo!")
    print(f"  Username: {username}")
    print(f"  Password: {password}")
    print(f"  Email: {email}")
    print("\n[Puoi ora accedere all'area admin!]")
    
except auth.EmailAlreadyExistsError:
    print(f"[ERR] Errore: L'email {email} e' gia registrata")
    print("\n[Suggerimento: Usa python scripts/add-existing-user-as-admin.py]")
    sys.exit(1)
    
except Exception as e:
    print(f"[ERR] Errore durante la creazione: {e}")
    sys.exit(1)

