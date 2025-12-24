"""
Script per aggiungere un utente ESISTENTE (già presente in Firebase Auth)
alla collezione `admins` su Firestore.

Uso tipico:
- Hai già creato l'utente in Firebase Authentication (via signup, console, ecc.)
- Vuoi abilitarlo come admin nel tuo progetto (documento `admins/{uid}`)

Requisiti:
- pip install firebase-admin python-dotenv

Variabili d'ambiente (in .env.local nella root del progetto):
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL
- FIREBASE_ADMIN_PRIVATE_KEY

NOTE IMPORTANTI:
- Python NON carica automaticamente `.env.local` (a differenza di Next.js).
  Questo script lo carica esplicitamente usando python-dotenv.
"""

import os
import sys
from pathlib import Path

print("Inizializzazione Firebase Admin SDK...")

# 1) Carica .env.local (root progetto: una cartella sopra /scripts)
try:
    from dotenv import load_dotenv  # pip install python-dotenv
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ File .env.local caricato da: {env_path}")
    else:
        print(f"⚠️  File .env.local non trovato in: {env_path}")
        print("   Verrà cercato anche nel percorso corrente...")
        load_dotenv()  # Prova anche il percorso corrente
except ImportError:
    print("❌ Errore: python-dotenv non installato")
    print("Installa con: pip install python-dotenv")
    sys.exit(1)

# 2) Importa Firebase Admin
try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth
except ImportError:
    print("❌ Errore: firebase-admin non installato")
    print("Installa con: pip install firebase-admin")
    sys.exit(1)

# 3) Inizializza Firebase Admin (con credenziali da env)
try:
    project_id = os.getenv("FIREBASE_ADMIN_PROJECT_ID")
    client_email = os.getenv("FIREBASE_ADMIN_CLIENT_EMAIL")
    private_key_raw = os.getenv("FIREBASE_ADMIN_PRIVATE_KEY")

    if not project_id or not client_email or not private_key_raw:
        print("❌ Errore: Variabili d'ambiente Firebase Admin mancanti")
        print("Assicurati di aver configurato nel file .env.local (root progetto):")
        print("- FIREBASE_ADMIN_PROJECT_ID")
        print("- FIREBASE_ADMIN_CLIENT_EMAIL")
        print("- FIREBASE_ADMIN_PRIVATE_KEY")
        print("\nSuggerimento: verifica che il file sia davvero `.env.local` (non `.env.local.txt`).")
        sys.exit(1)

    # Converti i newline letterali \\n in newline reali
    private_key = private_key_raw.replace("\\n", "\n")

    # Costruisci il dizionario completo delle credenziali con tutti i campi richiesti
    cred_dict = {
        "type": "service_account",
        "project_id": project_id,
        "private_key_id": os.getenv("FIREBASE_ADMIN_PRIVATE_KEY_ID", ""),  # Opzionale
        "private_key": private_key,
        "client_email": client_email,
        "client_id": os.getenv("FIREBASE_ADMIN_CLIENT_ID", ""),  # Opzionale
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email.replace('@', '%40')}",
    }

    # Inizializza solo una volta
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    print("✅ Connesso a Firestore")

except Exception as e:
    print(f"❌ Errore di connessione: {e}")
    sys.exit(1)

# 4) Richiedi input
print("\n👤 Aggiunta utente esistente come admin")
print("=" * 50)

email = input("Email dell'utente: ").strip()
if not email:
    print("❌ Email obbligatoria")
    sys.exit(1)

# 5) Cerca utente e aggiorna/crea doc admins/{uid}
try:
    print(f"\n🔍 Ricerca utente con email {email}...")
    user = auth.get_user_by_email(email)
    print(f"✅ Utente trovato con UID: {user.uid}")

    admin_ref = db.collection("admins").document(user.uid)
    admin_doc = admin_ref.get()

    if admin_doc.exists:
        admin_data = admin_doc.to_dict() or {}
        if admin_data.get("active") is True:
            print("⚠️  L'utente è già admin (attivo)")
            response = input("Vuoi aggiornare i dati? (s/n): ").strip().lower()
            if response != "s":
                print("Operazione annullata")
                sys.exit(0)
        else:
            print("⚠️  L'utente è admin ma non attivo (verrà riattivato)")
    else:
        print("📝 Aggiunta a collezione admins...")

    admin_ref.set(
        {
            "active": True,
            "email": email,
            "name": user.display_name,
            "updatedAt": firestore.SERVER_TIMESTAMP,
            "updatedBy": "script",
        },
        merge=True,
    )

    print("✅ Admin configurato con successo!")

    print("\n" + "=" * 50)
    print("✅ Riepilogo:")
    print(f"  • UID: {user.uid}")
    print(f"  • Email: {email}")
    print(f"  • Nome: {user.display_name or 'N/A'}")
    print("  • Status: Attivo")
    print("\n✨ L'utente può ora accedere all'area admin!")

except auth.UserNotFoundError:
    print(f"❌ Errore: Nessun utente trovato con email {email}")
    print("\n💡 Suggerimento: Crea prima l'utente in Firebase Auth")
    print("   oppure usa: python scripts/create-admin.py")
    sys.exit(1)

except Exception as e:
    print(f"❌ Errore: {e}")
    sys.exit(1)
