"""
Script per creare un utente admin nel database Firestore
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
        print(f"✅ File .env.local caricato da: {env_path}")
except ImportError:
    print("⚠️  python-dotenv non installato. Assicurati di aver configurato le variabili d'ambiente manualmente.")
    print("   Oppure installa: pip install python-dotenv")

# Importa Firebase Admin
try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth
except ImportError:
    print("❌ Errore: firebase-admin non installato")
    print("Installa con: pip install firebase-admin")
    sys.exit(1)

# Inizializza Firebase Admin
try:
    # Carica le credenziali dalle variabili d'ambiente
    project_id = os.getenv('FIREBASE_ADMIN_PROJECT_ID')
    client_email = os.getenv('FIREBASE_ADMIN_CLIENT_EMAIL')
    private_key = os.getenv('FIREBASE_ADMIN_PRIVATE_KEY', '').replace('\\n', '\n')
    
    if not all([project_id, client_email, private_key]):
        print("❌ Errore: Variabili d'ambiente Firebase Admin mancanti")
        print("Assicurati di aver configurato:")
        print("- FIREBASE_ADMIN_PROJECT_ID")
        print("- FIREBASE_ADMIN_CLIENT_EMAIL")
        print("- FIREBASE_ADMIN_PRIVATE_KEY")
        sys.exit(1)
    
    # Costruisci il dizionario completo delle credenziali con tutti i campi richiesti
    cred_dict = {
        "type": "service_account",
        "project_id": project_id,
        "private_key_id": os.getenv('FIREBASE_ADMIN_PRIVATE_KEY_ID', ''),  # Opzionale
        "private_key": private_key,
        "client_email": client_email,
        "client_id": os.getenv('FIREBASE_ADMIN_CLIENT_ID', ''),  # Opzionale
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email.replace('@', '%40')}",
    }
    
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Connesso a Firestore")
    
except Exception as e:
    print(f"❌ Errore di connessione: {e}")
    sys.exit(1)

# Richiedi informazioni utente
print("\n👤 Creazione utente admin")
print("=" * 50)

email = input("Email dell'utente admin: ").strip()
if not email:
    print("❌ Email obbligatoria")
    sys.exit(1)

password = input("Password (minimo 6 caratteri): ").strip()
if len(password) < 6:
    print("❌ Password troppo corta (minimo 6 caratteri)")
    sys.exit(1)

name = input("Nome (opzionale): ").strip() or None

# Crea utente in Firebase Auth
try:
    print(f"\n📝 Creazione utente in Firebase Auth...")
    user = auth.create_user(
        email=email,
        password=password,
        display_name=name,
        email_verified=False,
    )
    print(f"✅ Utente creato con UID: {user.uid}")
    
    # Aggiungi alla collezione admins
    print(f"📝 Aggiunta a collezione admins...")
    admin_ref = db.collection('admins').document(user.uid)
    admin_ref.set({
        'active': True,
        'email': email,
        'name': name,
        'createdAt': firestore.SERVER_TIMESTAMP,
        'createdBy': 'script',
    })
    print(f"✅ Admin creato con successo!")
    
    print("\n" + "=" * 50)
    print("✅ Riepilogo:")
    print(f"  • UID: {user.uid}")
    print(f"  • Email: {email}")
    print(f"  • Nome: {name or 'N/A'}")
    print(f"  • Status: Attivo")
    print("\n✨ L'utente può ora accedere all'area admin!")
    
except auth.EmailAlreadyExistsError:
    print(f"❌ Errore: L'email {email} è già registrata")
    print("\n💡 Suggerimento: Se vuoi rendere admin un utente esistente,")
    print("   usa questo script per aggiungerlo alla collezione admins:")
    print("\n   python scripts/add-existing-user-as-admin.py")
    sys.exit(1)
    
except Exception as e:
    print(f"❌ Errore durante la creazione: {e}")
    sys.exit(1)

