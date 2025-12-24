"""
Script per popolare il database Firestore con dati di esempio
"""
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

print("Inizializzazione Firebase Admin SDK...")

# Carica .env.local se esiste
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ File .env.local caricato da: {env_path}")
except ImportError:
    pass  # python-dotenv opzionale per questo script

# Importa Firebase Admin
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("❌ Errore: firebase-admin non installato")
    print("Installa con: pip install firebase-admin")
    exit(1)

# Inizializza Firebase Admin
try:
    # Carica le credenziali dalle variabili d'ambiente
    project_id = os.getenv('FIREBASE_ADMIN_PROJECT_ID')
    client_email = os.getenv('FIREBASE_ADMIN_CLIENT_EMAIL')
    private_key_raw = os.getenv('FIREBASE_ADMIN_PRIVATE_KEY', '')
    
    if not all([project_id, client_email, private_key_raw]):
        print("❌ Errore: Variabili d'ambiente Firebase Admin mancanti")
        print("Assicurati di aver configurato:")
        print("- FIREBASE_ADMIN_PROJECT_ID")
        print("- FIREBASE_ADMIN_CLIENT_EMAIL")
        print("- FIREBASE_ADMIN_PRIVATE_KEY")
        exit(1)
    
    # Converti i newline letterali \\n in newline reali
    private_key = private_key_raw.replace("\\n", "\n")
    
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
    exit(1)

# Popola la configurazione del salone
print("\n📝 Creazione configurazione salone...")
config_ref = db.collection('settings').document('config')
config_ref.set({
    'openingTime': '09:00',
    'closingTime': '19:00',
    'timeStep': 15,
    'resources': 3,
    'bufferTime': 10,
})
print("✅ Configurazione creata")

# Popola i servizi
print("\n💇 Creazione servizi...")
services = [
    {
        'name': 'Taglio Donna',
        'duration': 45,
        'price': 35.00,
        'description': 'Taglio professionale per capelli donna',
        'active': True,
    },
    {
        'name': 'Taglio Uomo',
        'duration': 30,
        'price': 25.00,
        'description': 'Taglio classico o moderno per capelli uomo',
        'active': True,
    },
    {
        'name': 'Piega',
        'duration': 30,
        'price': 20.00,
        'description': 'Piega professionale con phon',
        'active': True,
    },
    {
        'name': 'Colore',
        'duration': 90,
        'price': 60.00,
        'description': 'Colorazione completa',
        'active': True,
    },
    {
        'name': 'Meches',
        'duration': 120,
        'price': 80.00,
        'description': 'Meches o colpi di sole',
        'active': True,
    },
]

services_ref = db.collection('services')
for service in services:
    services_ref.add(service)
    print(f"  ✅ {service['name']} - €{service['price']} ({service['duration']}min)")

# Crea alcune prenotazioni di esempio
print("\n📅 Creazione prenotazioni di esempio...")
bookings_ref = db.collection('bookings')
today = datetime.now()
tomorrow = today + timedelta(days=1)

example_bookings = [
    {
        'customerName': 'Mario Rossi',
        'customerEmail': 'mario.rossi@example.com',
        'customerPhone': '333-1234567',
        'serviceName': 'Taglio Uomo',
        'serviceDuration': 30,
        'servicePrice': 25.00,
        'date': tomorrow.strftime('%Y-%m-%d'),
        'startTime': '10:00',
        'endTime': '10:30',
        'status': 'PENDING',
        'createdAt': firestore.SERVER_TIMESTAMP,
    },
    {
        'customerName': 'Laura Bianchi',
        'customerEmail': 'laura.bianchi@example.com',
        'customerPhone': '333-7654321',
        'serviceName': 'Piega',
        'serviceDuration': 30,
        'servicePrice': 20.00,
        'date': tomorrow.strftime('%Y-%m-%d'),
        'startTime': '14:00',
        'endTime': '14:30',
        'status': 'CONFIRMED',
        'createdAt': firestore.SERVER_TIMESTAMP,
    },
]

for booking in example_bookings:
    bookings_ref.add(booking)
    print(f"  ✅ {booking['customerName']} - {booking['date']} {booking['startTime']}")

print("\n🎉 Database popolato con successo!")
print("\n📊 Riepilogo:")
print(f"  • 1 configurazione salone")
print(f"  • {len(services)} servizi")
print(f"  • {len(example_bookings)} prenotazioni di esempio")
print("\n✨ Ora puoi utilizzare l'app!")
