"""Script per verificare la configurazione del salone"""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    project_id = os.getenv('FIREBASE_ADMIN_PROJECT_ID')
    client_email = os.getenv('FIREBASE_ADMIN_CLIENT_EMAIL')
    private_key = os.getenv('FIREBASE_ADMIN_PRIVATE_KEY', '').replace('\\n', '\n')
    
    cred_dict = {
        "type": "service_account",
        "project_id": project_id,
        "private_key": private_key,
        "client_email": client_email,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email.replace('@', '%40')}",
    }
    
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Verifica configurazione
config = db.collection('settings').document('config').get()
if config.exists:
    data = config.to_dict()
    print("Configurazione trovata:")
    print(f"  openingTime: {data.get('openingTime', 'N/A')}")
    print(f"  closingTime: {data.get('closingTime', 'N/A')}")
    print(f"  timeStep: {data.get('timeStep', 'N/A')}")
    print(f"  resources: {data.get('resources', 'N/A')}")
    print(f"  bufferTime: {data.get('bufferTime', 'N/A')}")
    print(f"  closedDaysOfWeek: {data.get('closedDaysOfWeek', [])}")
    print(f"  closedDates: {data.get('closedDates', [])}")
else:
    print("Configurazione NON trovata! Creando configurazione di default...")
    db.collection('settings').document('config').set({
        'openingTime': '09:00',
        'closingTime': '19:00',
        'timeStep': 15,
        'resources': 3,
        'bufferTime': 10,
        'closedDaysOfWeek': [],
        'closedDates': [],
    })
    print("Configurazione creata!")

