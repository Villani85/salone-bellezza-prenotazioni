"""Script per verificare i servizi nel database"""
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

# Conta servizi attivi
services = db.collection('services').where('active', '==', True).get()
print(f"Servizi attivi: {len(list(services))}")

# Mostra alcuni servizi
for service in list(services)[:5]:
    data = service.to_dict()
    print(f"  - {data.get('name')} ({data.get('category', 'N/A')}) - EUR {data.get('price', 0)}")

