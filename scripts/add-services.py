"""
Script per aggiungere servizi tipici di un salone di bellezza
Esegui con: python scripts/add-services.py
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
    from firebase_admin import credentials, firestore
except ImportError:
    print("[ERR] Errore: firebase-admin non installato")
    print("Installa con: pip install firebase-admin")
    exit(1)

# Inizializza Firebase Admin
try:
    project_id = os.getenv('FIREBASE_ADMIN_PROJECT_ID')
    client_email = os.getenv('FIREBASE_ADMIN_CLIENT_EMAIL')
    private_key_raw = os.getenv('FIREBASE_ADMIN_PRIVATE_KEY', '')
    
    if not all([project_id, client_email, private_key_raw]):
        print("[ERR] Errore: Variabili d'ambiente Firebase Admin mancanti")
        print("Assicurati di aver configurato:")
        print("- FIREBASE_ADMIN_PROJECT_ID")
        print("- FIREBASE_ADMIN_CLIENT_EMAIL")
        print("- FIREBASE_ADMIN_PRIVATE_KEY")
        exit(1)
    
    private_key = private_key_raw.replace("\\n", "\n")
    
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
    
    # Inizializza solo se non è già inizializzato
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    print("[OK] Connesso a Firestore")
    
except Exception as e:
    print(f"[ERR] Errore di connessione: {e}")
    exit(1)

# Lista completa di servizi per salone di bellezza
services = [
    # ========== CAPELLI ==========
    {
        'name': 'Taglio Donna',
        'category': 'Capelli',
        'description': 'Taglio professionale per capelli donna con styling finale',
        'duration': 45,
        'price': 35.00,
        'active': True,
    },
    {
        'name': 'Taglio Uomo',
        'category': 'Capelli',
        'description': 'Taglio classico o moderno per capelli uomo',
        'duration': 30,
        'price': 25.00,
        'active': True,
    },
    {
        'name': 'Taglio Bambino',
        'category': 'Capelli',
        'description': 'Taglio per bambini fino a 12 anni',
        'duration': 25,
        'price': 18.00,
        'active': True,
    },
    {
        'name': 'Piega',
        'category': 'Capelli',
        'description': 'Piega professionale con phon e styling',
        'duration': 30,
        'price': 20.00,
        'active': True,
    },
    {
        'name': 'Piega Lunga',
        'category': 'Capelli',
        'description': 'Piega per capelli lunghi con styling completo',
        'duration': 45,
        'price': 30.00,
        'active': True,
    },
    {
        'name': 'Colore Completo',
        'category': 'Capelli',
        'description': 'Colorazione completa con prodotti professionali',
        'duration': 90,
        'price': 60.00,
        'active': True,
    },
    {
        'name': 'Colore Radici',
        'category': 'Capelli',
        'description': 'Ritocco colore solo sulle radici',
        'duration': 60,
        'price': 45.00,
        'active': True,
    },
    {
        'name': 'Meches',
        'category': 'Capelli',
        'description': 'Meches o colpi di sole per effetti naturali',
        'duration': 120,
        'price': 80.00,
        'active': True,
    },
    {
        'name': 'Balayage',
        'category': 'Capelli',
        'description': 'Tecnica balayage per effetti sfumati e naturali',
        'duration': 150,
        'price': 100.00,
        'active': True,
    },
    {
        'name': 'Trattamento Capelli',
        'category': 'Capelli',
        'description': 'Trattamento idratante e ristrutturante',
        'duration': 30,
        'price': 25.00,
        'active': True,
    },
    {
        'name': 'Taglio + Piega',
        'category': 'Capelli',
        'description': 'Taglio e piega completo',
        'duration': 60,
        'price': 50.00,
        'active': True,
    },
    {
        'name': 'Taglio + Colore',
        'category': 'Capelli',
        'description': 'Taglio e colorazione completa',
        'duration': 120,
        'price': 85.00,
        'active': True,
    },
    {
        'name': 'Permanente',
        'category': 'Capelli',
        'description': 'Permanente per capelli mossi o ricci',
        'duration': 120,
        'price': 70.00,
        'active': True,
    },
    {
        'name': 'Stiraggio',
        'category': 'Capelli',
        'description': 'Stiraggio chimico per capelli lisci',
        'duration': 180,
        'price': 120.00,
        'active': True,
    },
    
    # ========== ESTETICA ==========
    {
        'name': 'Trattamento Viso',
        'category': 'Estetica',
        'description': 'Trattamento viso idratante e purificante',
        'duration': 60,
        'price': 45.00,
        'active': True,
    },
    {
        'name': 'Trattamento Viso Anti-Age',
        'category': 'Estetica',
        'description': 'Trattamento viso anti-età con prodotti premium',
        'duration': 75,
        'price': 60.00,
        'active': True,
    },
    {
        'name': 'Pulizia Viso',
        'category': 'Estetica',
        'description': 'Pulizia viso profonda con estrazione punti neri',
        'duration': 60,
        'price': 50.00,
        'active': True,
    },
    {
        'name': 'Massaggio Viso',
        'category': 'Estetica',
        'description': 'Massaggio viso rilassante e drenante',
        'duration': 30,
        'price': 30.00,
        'active': True,
    },
    {
        'name': 'Massaggio Corpo',
        'category': 'Estetica',
        'description': 'Massaggio corpo rilassante completo',
        'duration': 60,
        'price': 55.00,
        'active': True,
    },
    {
        'name': 'Massaggio Drenante',
        'category': 'Estetica',
        'description': 'Massaggio drenante per gambe e glutei',
        'duration': 45,
        'price': 45.00,
        'active': True,
    },
    {
        'name': 'Trattamento Corpo',
        'category': 'Estetica',
        'description': 'Trattamento corpo idratante e rassodante',
        'duration': 60,
        'price': 50.00,
        'active': True,
    },
    {
        'name': 'Trattamento Cellulite',
        'category': 'Estetica',
        'description': 'Trattamento anticellulite con prodotti specifici',
        'duration': 60,
        'price': 60.00,
        'active': True,
    },
    
    # ========== UNGHIE ==========
    {
        'name': 'Manicure Classica',
        'category': 'Unghie',
        'description': 'Manicure classica con smalto tradizionale',
        'duration': 30,
        'price': 20.00,
        'active': True,
    },
    {
        'name': 'Manicure Semipermanente',
        'category': 'Unghie',
        'description': 'Manicure con smalto semipermanente',
        'duration': 45,
        'price': 30.00,
        'active': True,
    },
    {
        'name': 'Pedicure Classica',
        'category': 'Unghie',
        'description': 'Pedicure classica con smalto tradizionale',
        'duration': 45,
        'price': 30.00,
        'active': True,
    },
    {
        'name': 'Pedicure Semipermanente',
        'category': 'Unghie',
        'description': 'Pedicure con smalto semipermanente',
        'duration': 60,
        'price': 40.00,
        'active': True,
    },
    {
        'name': 'Ricostruzione Unghie',
        'category': 'Unghie',
        'description': 'Ricostruzione unghie con gel o acrilico',
        'duration': 90,
        'price': 50.00,
        'active': True,
    },
    {
        'name': 'Nail Art',
        'category': 'Unghie',
        'description': 'Decorazione unghie con nail art personalizzata',
        'duration': 60,
        'price': 35.00,
        'active': True,
    },
    {
        'name': 'Manicure + Pedicure',
        'category': 'Unghie',
        'description': 'Trattamento completo mani e piedi',
        'duration': 90,
        'price': 60.00,
        'active': True,
    },
    {
        'name': 'Rimozione Semipermante',
        'category': 'Unghie',
        'description': 'Rimozione smalto semipermanente',
        'duration': 20,
        'price': 10.00,
        'active': True,
    },
    
    # ========== DEPILAZIONE ==========
    {
        'name': 'Ceretta Gambe Complete',
        'category': 'Depilazione',
        'description': 'Depilazione completa gambe con ceretta',
        'duration': 45,
        'price': 40.00,
        'active': True,
    },
    {
        'name': 'Ceretta Gambe Mezze',
        'category': 'Depilazione',
        'description': 'Depilazione mezze gambe con ceretta',
        'duration': 30,
        'price': 25.00,
        'active': True,
    },
    {
        'name': 'Ceretta Bikini',
        'category': 'Depilazione',
        'description': 'Depilazione zona bikini con ceretta',
        'duration': 30,
        'price': 30.00,
        'active': True,
    },
    {
        'name': 'Ceretta Ascelle',
        'category': 'Depilazione',
        'description': 'Depilazione ascelle con ceretta',
        'duration': 15,
        'price': 15.00,
        'active': True,
    },
    {
        'name': 'Ceretta Braccia',
        'category': 'Depilazione',
        'description': 'Depilazione braccia complete con ceretta',
        'duration': 30,
        'price': 25.00,
        'active': True,
    },
    {
        'name': 'Ceretta Viso',
        'category': 'Depilazione',
        'description': 'Depilazione viso (baffi, sopracciglia, mento)',
        'duration': 20,
        'price': 20.00,
        'active': True,
    },
    {
        'name': 'Ceretta Completa',
        'category': 'Depilazione',
        'description': 'Depilazione completa corpo con ceretta',
        'duration': 120,
        'price': 100.00,
        'active': True,
    },
]

# Aggiungi i servizi
print("\n[Aggiunta servizi salone di bellezza...]\n")

services_ref = db.collection('services')
added = 0
skipped = 0

for service in services:
    try:
        # Controlla se il servizio esiste già (per nome)
        existing_query = services_ref.where('name', '==', service['name']).get()
        
        if existing_query:
            print(f"  [SKIP] {service['name']} - gia esistente")
            skipped += 1
            continue
        
        # Aggiungi timestamp
        service['createdAt'] = firestore.SERVER_TIMESTAMP
        service['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        services_ref.add(service)
        print(f"  [OK] {service['name']} - EUR {service['price']} ({service['duration']}min) - {service['category']}")
        added += 1
    except Exception as e:
        print(f"  [ERR] Errore aggiungendo {service['name']}: {e}")

print(f"\n[Completato!]")
print(f"  - {added} servizi aggiunti")
print(f"  - {skipped} servizi gia esistenti (saltati)")
print(f"  - Totale: {len(services)} servizi")
print("\n[Script completato con successo!]")

