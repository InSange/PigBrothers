import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, db
from dotenv import load_dotenv

load_dotenv(dotenv_path="./.env")

firebase_config = {
    "type": os.environ.get("TYPE"),
    "project_id": os.environ.get("PROJECT_ID"),
    "private_key_id": os.environ.get("PRIVATE_KEY_ID"),
    "private_key": os.environ.get("PRIVATE_KEY").replace("!", "\n"),
    "client_email": os.environ.get("CLIENT_EMAIL"),
    "client_id": os.environ.get("CLIENT_ID"),
    "auth_uri": os.environ.get("AUTH_URI"),
    "token_uri": os.environ.get("TOKEN_URI"),
    "auth_provider_x509_cert_url": os.environ.get("AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.environ.get("CLIENT_X509_CERT_URL"),
    "universe_domain": os.environ.get("UNIVERSE_DOMAIN")
}


try:
    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://pigbrothers-b3b15-default-rtdb.firebaseio.com/'
    })
    print("Firebase Admin SDK Initialized!")
except Exception as e:
    print("Firebase 초기화 중 오류 발생:", str(e))


# Firestore Ŭ���̾�Ʈ ����
firestore_client = firestore.client()

# Realtime Database Ŭ���̾�Ʈ ����
realtime_db = db.reference("/")

print("Firebase Admin SDK Initialized!")